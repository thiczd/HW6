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
    const parseDate = d3.timeParse("%m/%d/%Y"); // Match your input format
    const data = this.props.csv_data.map((item) => ({
      ...item,
      Date: parseDate(item.Date), // Parse the date as-is
    }));
    console.log(data);

    const margin = { top: 30, right: 30, bottom: 50, left: 10 },
      width = 500,
      height = 400,
      innerWidth = width - margin.left - margin.right,
      innerHeight = height - margin.top - margin.bottom;

    // TODO CENTER THE CHART USING MARGIN
    // TODO LEGEND

    ///////////////////////////////////////////////////////////
    //// STREAM GRAPH ////
    //////////////////////////////////////////////////////////

    const maxSum = d3.sum([
      d3.max(data, (d) => d.GPT),
      d3.max(data, (d) => d.Gemini),
      d3.max(data, (d) => d.PaLM),
      d3.max(data, (d) => d.Claude),
      d3.max(data, (d) => d.LLaMA),
    ]);
    var xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.Date))
      .range([0, innerWidth]);
    var yScale = d3.scaleLinear().domain([0, maxSum]).range([innerHeight, 0]);
    var colors = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00"];
    var stack = d3
      .stack()
      //      .keys(["GPT", "Gemini", "PaLM", "Claude", "LLaMA"])

      .keys(["LLaMA", "Claude", "PaLM", "Gemini", "GPT"])
      .offset(d3.stackOffsetWiggle);
    var stackedSeries = stack(data);
    var areaGenerator = d3
      .area()
      .x((d) => xScale(d.data.Date))
      .y0((d) => yScale(d[0]))
      .y1((d) => yScale(d[1]))
      .curve(d3.curveCardinal);
    var svg = d3.select(".container");

    ///////////////////////////////////////////////////////////
    //// HOVER BAR CHART ////
    //////////////////////////////////////////////////////////

    var tooltip = d3
      .select(".mychart")
      .select(".bar-chart")
      .style("visibility", "hidden")
      .append("rect")
      .attr("width", 200)
      .attr("height", 100)
      .attr("stroke", "black") // Add black border
      .attr("fill", "white"); // Ensure it's empty (transparent)

    ///////////////////////////////////////////////////////////
    //// END HOVER BAR CHART ////
    //////////////////////////////////////////////////////////

    // POPULATE DATA + TOOLTIP TUNING

    svg
      .selectAll("path")
      .data(stackedSeries)
      .join("path")
      .style("fill", (d, i) => colors[i])
      .attr("d", (d) => areaGenerator(d))
      .on("mouseover", function (event, d) {
        tooltip.style("visibility", "visible").text(d.key); // Show key of the series
      })
      .on("mousemove", function (event) {
        const [mouseX, mouseY] = d3.pointer(event); // Get mouse position relative to the SVG
        tooltip.attr(
          "transform",
          `translate(${mouseX + 10}, ${mouseY + 10})` // Offset tooltip to avoid overlapping
        );
      })
      .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
      });

    // END POPULATING
    svg
      .selectAll(".x.axis")
      .data([null])
      .join("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0,${height - 20})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b"))); // Formats as month name

    ///////////////////////////////////////////////////////////
    ////END  STREAM GRAPH ////
    //////////////////////////////////////////////////////////

    //keys(["GPT", "Gemini", "PaLM", "Claude", "LLaMA"])

    ///////////////////////////////////////////////////////////
    //LEGEND//
    //////////////////////////////////////////////////////////

    svg
      .append("rect")
      .attr("x", innerWidth + margin.left + margin.right)
      .attr("y", 50)
      .attr("width", 20)
      .attr("height", 20)
      .attr("stroke", "black")
      .attr("fill", "#e41a1c");

    svg
      .append("text")
      .text("LLaMA-3.1")
      .attr("x", innerWidth + margin.left + margin.right + 30)
      .attr("y", 65);

    svg
      .append("rect")
      .attr("x", innerWidth + margin.left + margin.right)
      .attr("y", 80)
      .attr("width", 20)
      .attr("height", 20)
      .attr("stroke", "black")
      .attr("fill", "#377eb8");

    svg
      .append("text")
      .text("Claude")
      .attr("x", innerWidth + margin.left + margin.right + 30)
      .attr("y", 95);

    svg
      .append("rect")
      .attr("x", innerWidth + margin.left + margin.right)
      .attr("y", 110)
      .attr("width", 20)
      .attr("height", 20)
      .attr("stroke", "black")
      .attr("fill", "#4daf4a");

    svg
      .append("text")
      .text("PaLM-2")
      .attr("x", innerWidth + margin.left + margin.right + 30)
      .attr("y", 125);

    svg
      .append("rect")
      .attr("x", innerWidth + margin.left + margin.right)
      .attr("y", 140)
      .attr("width", 20)
      .attr("height", 20)
      .attr("stroke", "black")
      .attr("fill", "#984ea3");

    svg
      .append("text")
      .text("Gemini")
      .attr("x", innerWidth + margin.left + margin.right + 30)
      .attr("y", 155);
    svg
      .append("rect")
      .attr("x", innerWidth + margin.left + margin.right)
      .attr("y", 170)
      .attr("width", 20)
      .attr("height", 20)
      .attr("stroke", "black")
      .attr("fill", "#ff7f00");

    svg
      .append("text")
      .text("GPT-4")
      .attr("x", innerWidth + margin.left + margin.right + 30)
      .attr("y", 185);

    ///////////////////////////////////////////////////////////
    // END LEGEND//
    //////////////////////////////////////////////////////////
  };

  render() {
    return (
      <div className="mychart">
        <svg width="700" height="400">
          <g className="container"></g>
          <g className="bar-chart"></g>
        </svg>
      </div>
    );
  }
}

export default Child1;
