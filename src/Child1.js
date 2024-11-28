import React, { Component } from "react";
import * as d3 from "d3";
import "./Child1.css";
class Child1 extends Component {
  componentDidMount() {
    // console.log(this.props.csv_data); // Use this data as default. When the user will upload data this props will provide you the updated data

    this.renderChart();
  }

  componentDidUpdate() {
    // console.log(this.props.csv_data);
    this.destroyChart();

    this.renderChart();
  }

  destroyChart = () => {
    // Completely clear the SVG by removing all child elements
    d3.select("#mychart").selectAll("*").remove();
    // Optionally reset the <g> element for consistent structure
    d3.select("#mychart").append("g");
  };

  renderChart = () => {
    const parseDate = d3.timeParse("%Y-%m-%d"); // Match your input format
    const data = this.props.csv_data.map((item) => ({
      ...item,
      Date: parseDate(item.Date), // Parse the date as-is
    }));
    const margin = { top: 30, right: 30, bottom: 50, left: 40 },
      width = 700,
      height = 400,
      innerWidth = 600 - margin.left - margin.right,
      innerHeight = 400 - margin.top - margin.bottom;
    // Extract the date range for xScale
    const dateExtent = d3.extent(data, (d) => d.Date);
    console.log(dateExtent);
    // TODO CENTER THE CHART USING MARGIN
    // TODO LEGEND
    const maxSum = d3.sum([
      d3.max(data, (d) => d.GPT),
      d3.max(data, (d) => d.Gemini),
      d3.max(data, (d) => d.PaLM),
      d3.max(data, (d) => d.Claude),
      d3.max(data, (d) => d.LLaMA),
    ]);
    var xScale = d3
      .scaleTime()
      .domain(d3.extent(dateExtent))
      .range([0, innerWidth]);
    var yScale = d3.scaleLinear().domain([0, maxSum]).range([innerHeight, 0]);
    var colors = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00"];
    var stack = d3
      .stack()
      .keys(["GPT", "Gemini", "PaLM", "Claude", "LLaMA"])
      .offset(d3.stackOffsetWiggle);
    var stackedSeries = stack(data);
    var areaGenerator = d3
      .area()
      .x((d) => xScale(d.data.Date))
      .y0((d) => yScale(d[0]))
      .y1((d) => yScale(d[1]))
      .curve(d3.curveCardinal);
    d3.select(".container")
      .selectAll("path")
      .data(stackedSeries)
      .join("path")
      .style("fill", (d, i) => colors[i])
      .attr("d", (d) => areaGenerator(d));
    d3.select(".container")
      .selectAll(".x.axis")
      .data([null])
      .join("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0,${height - 20})`)
      .call(d3.axisBottom(xScale));
  };

  render() {
    return (
      <div className="mychart">
        <svg width="700" height="400">
          <g className="container"></g>
        </svg>
      </div>
    );
  }
}

export default Child1;
