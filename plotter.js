class Plotter {
    constructor({dataAccessor, parentNode, cssClass, title, layout, x, y, refreshCallback}) {
        this.dataAccessor = dataAccessor
        this.layout = layout
        this.x = x
        this.y = y

        this.x.scale = d3
            .scaleLinear()
            .range([this.layout.marginLeft, this.layout.width - this.layout.marginRight])
        this.y.scale = d3
            .scaleLinear()
            .range([this.layout.height - this.layout.marginBottom, this.layout.marginTop])

        this.svg = parentNode
            .append('svg')
            .attr('viewBox', [0, 0, this.layout.width, this.layout.height])
            .attr('class', cssClass)
        this.plot = this.svg
            .append('g')
            .attr('class', 'plotarea')
        this.x.axis = d3.axisBottom(this.x.scale)
        this.x.axisGroup = this.svg
            .append('g')
            .attr('transform', `translate(0 ${this.layout.height - this.layout.marginBottom})`)
            .call(this.x.axis)
        this.y.axis = d3.axisLeft(this.y.scale)
        this.y.axisGroup = this.svg
            .append('g')
            .attr('transform', `translate(${this.layout.marginLeft} 0)`)
            .call(this.y.axis)

        this.svg.append('text')
            .attr('class', 'axis-label')
            .attr('y', 0)
            .attr('dy', '1.5em')
            .attr('x', (this.layout.height - this.layout.marginBottom - this.layout.marginTop) / -2 - this.layout.marginTop)
            .attr('transform', 'rotate(-90)')
            .text(y.label)
        this.svg.append('text')
            .attr('class', 'axis-label')
            .attr('y', this.layout.height)
            .attr('dy', '-1em')
            .attr('x', this.layout.marginLeft + (this.layout.width - this.layout.marginLeft - this.layout.marginRight) / 2)
            .text(x.label)
        this.svg.append('text')
            .attr('class', 'title')
            .attr('y', '0')
            .attr('x', this.layout.marginLeft + (this.layout.width - this.layout.marginLeft - this.layout.marginRight) / 2)
            .attr('dy', '1.2em')
            .text(title)

        this.refresh = () => refreshCallback(this)
        this.refresh()
    }
}

class Axis {
    constructor(field, title, scale, axis, axisGroup) {
        this.field = field
        this.title = title
        this.scale = scale
        this.axis = axis
        this.axisGroup = axisGroup
    }
}

function populateScatterplot({dataAccessor, x, y, plot}) {
    let contextData = dataAccessor()
    contextData = contextData.filter(d => d[x.field] && d[y.field])
    x.scale.domain([0, d3.max(contextData, d => d[x.field])])
    y.scale.domain([0, d3.max(contextData, d => d[y.field])])

    x.axisGroup
        .transition()
        .duration(500)
        .call(x.axis)
    y.axisGroup
        .transition()
        .duration(500)
        .call(y.axis)

    const dater = plot.selectAll('circle')
        .data(contextData)
    dater
        .enter()
        .append('circle')
        .merge(dater)
            .classed('target', d => d.IsWoman)
        .transition()
            .duration(500)
            .attr('cx', d => x.scale(d[x.field]))
            .attr('cy', d => y.scale(d[y.field]))
    dater
        .exit()
            .remove()
}