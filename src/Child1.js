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

      .keys(["GPT", "Gemini", "PaLM", "Claude", "LLaMA"])
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
        // MOUSEOVER used to handle the tooltip barchart

        // color mapping for each models
        var colors = {
          GPT: "#e41a1c",
          Gemini: "#377eb8",
          PaLM: "#4daf4a",
          Claude: "#984ea3",
          LLaMA: "#ff7f00",
        };

        const nameModel = d.key; // getting model name
        const dataModel = []; // used to store value from mouseover.
        d.forEach((value) => {
          // console.log(`for this key ${nameModel}`);
          // console.log(value.data[nameModel]);
          dataModel.push({
            // accessing specific value for this model and storing data
            date: value.data.Date,
            value: value.data[nameModel],
          });
        });
        // dataModel.forEach((item) => {
        //   console.log(`Date: ${item.date}, Value: ${item.value}`);
        // }); debug

        var margin = { top: 30, right: 30, bottom: 70, left: 60 },
          width = 360 - margin.left - margin.right,
          height = 200 - margin.top - margin.bottom;

        const xScale = d3
          .scaleBand()
          .domain(dataModel.map((d) => d.date))
          .range([0, width])
          .padding(0.1);

        const yScale = d3
          .scaleLinear()
          .domain([0, d3.max(dataModel, (d) => d.value)])
          .range([height, 0]);

        const barChartSvg = d3.select(".bar-chart");
        barChartSvg.html(""); // Clear previous content

        // Append a new SVG for backgrouhnd
        const svg = barChartSvg.append("svg");

        // Add a white background rect
        svg
          .append("rect")

          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .attr("fill", "white")
          .attr("stroke", "gray");

        // BAR CHART

        const chart = svg
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

        chart
          .selectAll(".bar")
          .data(dataModel)
          .join("rect")
          .attr("class", "bar")
          .attr("x", (d) => xScale(d.date))
          .attr("y", (d) => yScale(d.value))
          .attr("width", xScale.bandwidth())
          .attr("height", (d) => height - yScale(d.value))
          .attr("fill", colors[nameModel]);

        chart
          .append("g")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b")));

        chart.append("g").call(d3.axisLeft(yScale));
      })

      .on("mousemove", function (event) {
        const [mouseX, mouseY] = d3.pointer(event); // Get mouse position relative to the SVG
        d3.select(".bar-chart").attr(
          "transform",
          `translate(${mouseX + 10}, ${mouseY + 10})` // +10 to prevent overlap
        );
      })
      .on("mouseout", function () {
        // clear chart
        d3.select(".bar-chart").html("");
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
      .attr("fill", "#ff7f00");

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
      .attr("fill", "#984ea3");

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
      .attr("fill", "#377eb8");

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
      .attr("fill", "#e41a1c");

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
        <svg width="1000" height="900" style={{ marginLeft: 45 + "px" }}>
          <g className="container"></g>
          <g className="bar-chart"></g>
        </svg>
      </div>
    );
  }
}

export default Child1;
