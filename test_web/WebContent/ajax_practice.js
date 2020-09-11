//이지훈 LOS 버튼 클릭
$('#btn_los').click(function() {
    console.log('#############btn_los click');
    //debugger;

    //버튼 중복 방지
    var isRun = false;
    if(isRun){
        return;
    }

    $('#spn_los_spinner').toggle();

    var json = {
        "observer_x": 14135498.972322224,
        "observer_y": 4530139.721076026,
        "observer_height": 2,
        "target_height": 10,
        'interval_factor': 1,
        "semi_dimension": 500,
        "visible_color": "#0000FF",
        "invisible_color": "#FF0000",
        "image_alpha": 32,
        "image_shape": 1,
        "input_dem_level": 2,
        "output_directory": "jiin/mims",
        "output_file_format": ".png",
        "run_async": 0,
        "storage_type": 1
    };

    var interval;
    $.ajax({
        url : stmp.URL + '/height/viewshed'
        , type : 'post'
        , contentType : 'application/json'
        , data : JSON.stringify(json)
        , timeout : 60000
        , success : function(result) {
            console.log(result);

            (async function() {
                await sleep(5000);
            })();

            var infoUrl = stmp.URL + '/' + result['output_image_info_destination'];
            var imgUrl = stmp.URL + '/' + result['output_image_destination'];
            $.ajax({
                url : infoUrl
                , type : 'get'
                , success : function(info) {
                    console.log(info);
                    var infoSplit = info.replace(/\s/g,'').replace('(', '').replace(')', '').split(',');
                    console.log(infoSplit);
                    var minX = parseFloat(infoSplit[0]);
                    var minY = parseFloat(infoSplit[1]);
                    var maxX = parseFloat(infoSplit[2]);
                    var maxY = parseFloat(infoSplit[3]);

                    var minXmaxYDegrees = stmp.convert.metersToDegrees(minX, maxY);
                    var maxXmaxYDegrees = stmp.convert.metersToDegrees(maxX, maxY);
                    var maxXminYDegrees = stmp.convert.metersToDegrees(maxX, minY);
                    var minXminYDegrees = stmp.convert.metersToDegrees(minX, minY);

                    if (stmp.PRESENT_MAP_KIND === stmp.MAP_KIND.MAP_2D) {
                        stmp.mapObject.map.addSource('losSource', {
                            'type': 'image',
                            'url': imgUrl,
                            'coordinates': [
                                [minXmaxYDegrees.lon, minXmaxYDegrees.lat],
                                [maxXmaxYDegrees.lon, maxXmaxYDegrees.lat],
                                [maxXminYDegrees.lon, maxXminYDegrees.lat],
                                [minXminYDegrees.lon, minXminYDegrees.lat]
                            ]
                        });

                        stmp.mapObject.map.addLayer({
                            'id': 'losLayer',
                            'source': 'losSource',
                            'type': 'raster',
                            'paint': {
                                'raster-opacity': 1
                            }
                        });
                    } else {
                        // 3D LOS
                        stmp.mapObject.map.entities.add({
                            rectangle : {
                                coordinates : Cesium.Rectangle.fromDegrees(minXmaxYDegrees.lon, maxXminYDegrees.lat, maxXmaxYDegrees.lon, maxXmaxYDegrees.lat),
                                material : imgUrl,
                                classificationType : Cesium.ClassificationType.TERRAIN
                            }
                        });
                    }
                }
                , error : function(e) {
                    console.log(e);
                }
            })
        }
        ,error : function(result) {
            console.log(result);
        }
    });