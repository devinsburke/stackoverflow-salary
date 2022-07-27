class Plotter {
    static tooltipMap = Object.entries({
        Gender: 'Gender',
        Country: 'Country',
        US_State: 'US State',
        Age: 'Age',
        YearsCodeProRaw: 'Experience',
        EdLevel: 'Education',
        MainBranch: 'Status',
        Employment: 'Employment',
        ConvertedCompYearlyRaw: 'Compensation'
    })

    constructor({dataAccessor, keyAccessor, parentNode, cssClass, title, layout, x, y, refreshCallback}) {
        this.dataAccessor = dataAccessor
        this.keyAccessor = keyAccessor
        this.layout = layout
        this.x = x
        this.y = y
        this.title = title

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
            .attr('dy', '1em')
            .attr('x', (this.layout.height - this.layout.marginBottom - this.layout.marginTop) / -2 - this.layout.marginTop)
            .attr('transform', 'rotate(-90)')
            .text(this.y.title)
        this.svg.append('text')
            .attr('class', 'axis-label')
            .attr('y', this.layout.height)
            .attr('dy', '-.5em')
            .attr('x', this.layout.marginLeft + (this.layout.width - this.layout.marginLeft - this.layout.marginRight) / 2)
            .text(this.x.title)
        this.svg.append('text')
            .attr('class', 'title')
            .attr('y', '0')
            .attr('x', this.layout.marginLeft + (this.layout.width - this.layout.marginLeft - this.layout.marginRight) / 2)
            .attr('dy', '1em')
            .text(this.title)

        this.tooltip = d3.select('body')
            .append('dl')
            .attr('class', 'tooltip')
        const dater = this.tooltip
            .selectAll()
            .data(Plotter.tooltipMap, d => d[0])
            .enter()
        dater.append('dt')
            .text(d => d[1])
        dater.append('dd')
            .text('')

        this.refresh = () => refreshCallback(this)
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

function populateScatterplot({dataAccessor, keyAccessor, x, y, plot, tooltip}) {
    const contextData = dataAccessor().filter(d => d[x.field] && d[y.field])
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

    const dater = plot
        .selectAll('circle')
        .data(contextData, keyAccessor)
    dater
        .enter()
            .append('circle')
            .classed('target', d => d.IsWoman) // TODO: Un-hard code.
            .on('mousemove', (d, i) => tooltip.style('top', (d.y)+'px').style('left',(d.x)+'px'))
            .on('mouseover', (d, i) => {
                tooltip
                    .selectAll('dd')
                    .data(Object.entries(i), d => d[0])
                    .text(d => d[1])
                tooltip.style('visibility', 'visible')
            })
            .on('mouseout', () => tooltip.style('visibility', 'hidden'))
        .merge(dater)
            .transition()
                .duration(() => Math.floor(Math.random() * 1500))
                .attr('transform', '')
                .attr('cx', d => x.scale(d[x.field]))
                .attr('cy', d => y.scale(d[y.field]))
    dater
        .exit()
            .transition()
            .duration(() => Math.floor(Math.random() * 1500))
            .attr('transform', 'translate(0 -200)') // TODO: Un-hard code.
}