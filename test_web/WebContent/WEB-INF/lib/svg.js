// HTML DOM 선택
const canvas = d3.select(".canvas");

// append 새로운 태그 추가
// attr 속성 지정
const svg = canvas
  .append("svg")
  .attr("height", 600)
  .attr("width", 600);

// 메소드 체인 방식
svg
  .append("rect") // 사각형
  .attr("width", 200)
  .attr("height", 100)
  .attr("fill", "orange")
  .attr("x", 20)
  .attr("y", 20);

svg
  .append("circle") // 원형
  .attr("r", 50)
  .attr("cx", 300)
  .attr("cy", 70)
  .attr("fill", "purple");

svg
  .append("line") // 선
  .attr("x1", 370)
  .attr("x2", 400)
  .attr("y1", 20)
  .attr("y2", 120)
  .attr("stroke", "white");
  
svg.append("text") // text
  .attr('x', 20)
  .attr('y', 200)
  .attr('fill', 'white')
  .text('Hello Text')
  .style('font-falmily', 'arial'); // style 적용