const frequency = { 'Monthly': 12, 'Weekly': 52, 'Yearly': 1 }
const defaultLayout = {
    height: 200,
    width: 300,
    marginBottom: 40,
    marginLeft: 70,
    marginRight: 10,
    marginTop: 30,
}

let sectionIndex = 0
let fullData = []
let filteredData = []
let scatterplot

function cleanDataRow(row) {
    let usdTotalComp = parseInt(row.ConvertedCompYearly)
    if (!usdTotalComp) {
        // If they reported $0, treat it as omitted.
        usdTotalComp = NaN
    } else if (usdTotalComp > 500000) {
        // If the calculated total is >$500K, consider that they probably
        // filled it out wrong. Many users left the 'frequency' as Weekly
        // or Monthly yet entered their annual compensation.
        usdTotalComp /= frequency[row.CompFreq]
    } else if (
        usdTotalComp <= 5000
        && row.Country == 'United States of America'
        && row.Employment == 'Employed full-time'
        && row.MainBranch == 'I am a developer by profession'
        && parseInt(row.CompTotal) <= 500
    ) {
        // If the user is a full time US developer who supposedly makes
        // less than $5K/yr., consider that they may have filled it out
        // wrong. Many users appear to have entered their compensation
        // in thousands.
        usdTotalComp = parseInt(row.CompTotal) * 1000
    }

    const gender = row.Gender.split(';')

    return {
        MainBranch: row.MainBranch,
        Employment: row.Employment,
        Country: row.Country,
        US_State: row.US_State,
        Age: row.Age,
        EdLevel: row.EdLevel == row.EdLevel.replace('â€™', `'`),
        YearsCodePro: row.YearsCodePro == 'Less than one year' ? 0.5 : parseInt(row.YearsCodePro),
        ConvertedCompYearly: usdTotalComp,
        Gender: gender,
        IsMan: gender.includes('Man'),
        IsWoman: gender.includes('Woman')
    }
}

class Plotter {
    constructor({parentNode, cssClass, layout, axes, refreshFn}) {
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

function populateScatterplot({xScale, yScale, plot, xAxisGroup, yAxisGroup, xAxis, yAxis}) {
    const data = filteredData.filter(d =>
        d.ConvertedCompYearly
        && d.YearsCodePro
    )
    xScale.domain([0, d3.max(data, d => d.YearsCodePro)])
    yScale.domain([0, d3.max(data, d => d.ConvertedCompYearly)])

    xAxisGroup
        .transition()
        .duration(1000)
        .call(xAxis)
    yAxisGroup
        .transition()
        .duration(1000)
        .call(yAxis)

    const dater = plot.selectAll('circle')
        .data(data)
    dater
        .enter()
        .append('circle')
        .merge(dater)
        .transition()
        .duration(1000)
            .attr('class', d => d.IsWoman ? 'target' : '')
            .attr('cx', d => xScale(d.YearsCodePro))
            .attr('cy', d => yScale(d.ConvertedCompYearly))
    dater
        .exit()
            .remove()
}

function processData() {
    filteredData = fullData.filter(r =>
        r.MainBranch == 'I am a developer by profession'
        && r.Employment == 'Employed full-time'
        && r.Country == 'United States of America'
        && r.ConvertedCompYearly != 'NA'
        && (r.IsMan || r.IsWoman)
    )
    
    addSection('Intro', [
        'Each year, Stack Overflow hosts a survey asking developers numerous questions about their careers and preferences. Amongst the information collected is employment, geography, education, experience, age, gender identity, and compensation.',
        'As Stack Overflow is by far the largest Q&A social network for programmers, these surveys should be excellent sample datasets from which to aggregate accurate information about developers in general.',
        'Unfortunately, the latest Stack Overflow developer survey dataset available (2021) gives concerning insights about gender and compensation amongst professional developers in the United States.'
    ])
    
    addSection('Gender Representation and Compensation', [
        'Test test test'
    ], sect => {
        scatterplot = new Plotter({
            parentNode: sect,
            cssClass: 'scatterplot',
            layout: defaultLayout,
            axes: {
                title: 'Developer Compensation by Gender and Age',
                xLabel: 'Years Coding Professionally',
                yLabel: 'Annual Compensation (USD)'
            },
            refreshFn: populateScatterplot
        })
    })

    // addSection('Gender Presence and Compensation', [
    //     'Test test test'
    // ], sect => {
    //     const manData = filteredData.filter(d => d.IsMan)
    //     const womanData = filteredData.filter(d => d.IsWoman)
    //     const nonWomanData = filteredData.filter(d => !d.IsWoman)

    //     const donutArc = d3.arc()
    //         .innerRadius(0.3)
    //         .outerRadius(0.5)
    //     const pie = d3.pie()
    //         .sort(null)
    //         .startAngle(Math.PI)([
    //             womanData.length / filteredData.length,
    //             (filteredData.length - womanData.length) / filteredData.length
    //         ])

    //     const portions = sect
    //         .append('svg')
    //             .attr('class', 'measure')
    //             .attr('viewBox', '0 0 1 0.5')
    //         .append('g')
    //             .selectAll()
    //             .data(pie)
    //     portions
    //         .join('path')
    //             .attr('d', donutArc)
    //     portions
    //         .join('text')
    //             .text('hi')
    //             .attr('transform', d => donutArc.centroid(d))
    //             .style('text-anchor', 'middle')
    //             .style('font-size', '20%')
    // })
}

function addSection(title, textList, sectionFn) {
    const index = ++sectionIndex
    d3
        .select('#slide-list')
        .append('li')
            .attr('data-index', index)
            .text(title)

    const section = d3
        .select('main')
        .append('section')
            .attr('data-index', index)
            .attr('data-title', title)
    section
        .selectAll()
            .data(textList)
        .join('p')
            .text(t => t)
    
    if (sectionFn)
        sectionFn(section)
}

//donut = women make up just X% of developers
//donut = and they only earn x% of a male peer's salary
//---
//Why? Are they less qualified?
//...Nope. Women are slightly more educated than men, yet they
//...start out at lower salaries. Yet they are more likely to be
//...employed than men, meaning employers are more likely to hire and
//...retain them than men.
//---
//Scatterplot

(async() => {
    fullData = await d3.csv('./data.csv', cleanDataRow)
    processData();

    d3.select('aside').append('button')
        .text('Previous')
        .attr('id','previous')
        .on('click', _ => document.body.setAttribute('data-index', parseInt(document.body.getAttribute('data-index')) - 1))
    d3.select('aside').append('button')
        .text('Next')
        .attr('id','next')
        .on('click', _ => document.body.setAttribute('data-index', parseInt(document.body.getAttribute('data-index')) + 1))

    d3.select('aside').append('button')
        .text('Do the Thing')
        .on('click', _ => {
            filteredData = filteredData.filter(d => d.YearsCodePro <= 10)
            scatterplot.refresh()
        })
})()


// <Professionals|Students|All> <United States|Top 10 Countries|All>