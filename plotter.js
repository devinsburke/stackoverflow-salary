class Plotter {
    constructor({data, parentNode, cssClass, layout, axes, refreshFn}) {
        this.data = data
        this.layout = layout
        this.axes = axes

        this.xScale = d3
            .scaleLinear()
            .range([this.layout.marginLeft, this.layout.width - this.layout.marginRight])
        this.yScale = d3
            .scaleLinear()
            .range([this.layout.height - this.layout.marginBottom, this.layout.marginTop])

        this.svg = parentNode
            .append('svg')
            .attr('viewBox', [0, 0, this.layout.width, this.layout.height])
            .attr('class', cssClass)
        this.plot = this.svg
            .append('g')
            .attr('class', 'plotarea')
        this.xAxis = d3.axisBottom(this.xScale)
        this.xAxisGroup = this.svg
            .append('g')
            .attr('transform', `translate(0 ${this.layout.height - this.layout.marginBottom})`)
            .call(this.xAxis)
        this.yAxis = d3.axisLeft(this.yScale)
        this.yAxisGroup = this.svg
            .append('g')
            .attr('transform', `translate(${this.layout.marginLeft} 0)`)
            .call(this.yAxis)

        this.svg.append('text')
            .attr('class', 'axis-label')
            .attr('y', 0)
            .attr('dy', '1.5em')
            .attr('x', (this.layout.height - this.layout.marginBottom - this.layout.marginTop) / -2 - this.layout.marginTop)
            .attr('transform', 'rotate(-90)')
            .text(axes.yLabel)
        this.svg.append('text')
            .attr('class', 'axis-label')
            .attr('y', this.layout.height)
            .attr('dy', '-1em')
            .attr('x', this.layout.marginLeft + (this.layout.width - this.layout.marginLeft - this.layout.marginRight) / 2)
            .text(axes.xLabel)
        this.svg.append('text')
            .attr('class', 'title')
            .attr('y', '0')
            .attr('x', this.layout.marginLeft + (this.layout.width - this.layout.marginLeft - this.layout.marginRight) / 2)
            .attr('dy', '1.2em')
            .text(axes.title)

        this.refresh = () => refreshFn(this)
        this.refresh()
    }
}

class PlotHandler {
    #plots = []
    
}

function populateScatterplot({data, xScale, yScale, plot, xAxisGroup, yAxisGroup, xAxis, yAxis}) {
    let contextData = data.dataAccessor()
    contextData = contextData.filter(d => data.xValueAccessor(d) && data.yValueAccessor(d))
    xScale.domain([0, d3.max(contextData, data.xValueAccessor)])
    yScale.domain([0, d3.max(contextData, data.yValueAccessor)])

    xAxisGroup
        .transition()
        .duration(1000)
        .call(xAxis)
    yAxisGroup
        .transition()
        .duration(1000)
        .call(yAxis)

    const dater = plot.selectAll('circle')
        .data(contextData)
    dater
        .enter()
        .append('circle')
        .merge(dater)
        .transition()
        .duration(1000)
            .attr('class', d => d.IsWoman ? 'target' : '')
            .attr('cx', d => xScale(data.xValueAccessor(d)))
            .attr('cy', d => yScale(data.yValueAccessor(d)))
    dater
        .exit()
            .remove()
}