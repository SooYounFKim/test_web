var viewer = new Cesium.Viewer("cesiumContainer", {
    selectionIndicator: false,
    infoBox: false,
    terrainProvider: Cesium.createWorldTerrain(),
});

function createPoint(worldPosition) {
    var point = viewer.entities.add({
        position: worldPosition,
        point: {
            color: Cesium.Color.WHITE,
            pixelSize: 5,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
    });
    return point;
}

var drawingMode = "line";

function drawShape(positionData) {
    var shape;
    //Draw the final graph when positionData is an array, and draw a dynamic graph if it is function
    var value = typeof positionData.getValue === 'function' ? positionData.getValue(0) : positionData;
    //var start = activeShapePoints[0];
    //var end = activeShapePoints[activeShapePoints.length - 1];
    //var r = Math.sqrt(Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2));
    //r = r ? r : r + 1;
    shape = viewer.entities.add({
        position: activeShapePoints[0],
        name: 'Blue translucent, rotated, and extruded ellipse with outline',
        type: 'Selection tool',
        ellipse: {
            semiMinorAxis: new Cesium.CallbackProperty(function() {
                //radius distance between two points
                var r = Math.sqrt(Math.pow(value[0].x - value[value.length - 1].x, 2) + Math.pow(value[0].y - value[value.length - 1].y, 2));
                return r ? r : r + 1;
            }, false),
            semiMajorAxis: new Cesium.CallbackProperty(function() {
                var r = Math.sqrt(Math.pow(value[0].x - value[value.length - 1].x, 2) + Math.pow(value[0].y - value[value.length - 1].y, 2));
                return r ? r : r + 1;
            }, false),
            material: Cesium.Color.BLUE.withAlpha(0.5),
            outline: true
        }
    });
    return shape;
}

var activeShapePoints = [];
var activeShape;
var floatingPoint;

var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

handler.setInputAction(function(event) {
    // We use `viewer.scene.pickPosition` here instead of `viewer.camera.pickEllipsoid` so that
    // we get the correct point when mousing over terrain.
    var earthPosition = viewer.scene.pickPosition(event.position);
    // `earthPosition` will be undefined if our mouse is not over the globe.
    if (Cesium.defined(earthPosition)) {
        if (activeShapePoints.length === 0) {
            floatingPoint = createPoint(earthPosition);
            activeShapePoints.push(earthPosition);
            var dynamicPositions = new Cesium.CallbackProperty(function() {
                return activeShapePoints;
            }, false);
            activeShape = drawShape(dynamicPositions);
        }
        activeShapePoints.push(earthPosition);
        createPoint(earthPosition);
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

handler.setInputAction(function(event) {
    if (Cesium.defined(floatingPoint)) {
        var newPosition = viewer.scene.pickPosition(event.endPosition);
        if (Cesium.defined(newPosition)) {
            floatingPoint.position.setValue(newPosition);
            activeShapePoints.pop();
            activeShapePoints.push(newPosition);
        }
    }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

// Redraw the shape so it's not dynamic and remove the dynamic shape.
function terminateShape() {
    activeShapePoints.pop();
    drawShape(activeShapePoints);
    viewer.entities.remove(floatingPoint);
    viewer.entities.remove(activeShape);
    floatingPoint = undefined;
    activeShape = undefined;
    activeShapePoints = [];
}
handler.setInputAction(function(event) {
    terminateShape();
}, Cesium.ScreenSpaceEventType.LEFT_UP);

var options = [{
    text: 'Draw Lines',
    onselect: function() {
        terminateShape();
        drawingMode = 'line';
    }
}, {
    text: 'Draw Circle',
    onselect: function() {
        terminateShape();
        drawingMode = 'circle';
    }
}];

Sandcastle.addToolbarMenu(options);
// Zoom in to an area with mountains
viewer.camera.lookAt(Cesium.Cartesian3.fromDegrees(-122.2058, 46.1955, 1000.0), new Cesium.Cartesian3(5000.0, 5000.0, 5000.0));
viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);