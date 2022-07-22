const frequency = { 'Monthly': 12, 'Weekly': 52, 'Yearly': 1 }
const dim = {
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

let xScale, yScale, xAxis, yAxis, xAxisGroup, yAxisGroup, plot

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

function createScatterplot(container) {
    xScale = d3
        .scaleLinear()
        .range([dim.marginLeft, dim.width - dim.marginRight])
    yScale = d3
        .scaleLinear()
        .range([dim.height - dim.marginBottom, dim.marginTop])

    const svg = container
        .append('svg')
        .attr('viewBox', [0, 0, dim.width, dim.height])
        .attr('class', 'scatterplot')
    plot = svg
        .append('g')
        .attr('class', 'plotarea')
    xAxis = d3.axisBottom(xScale)
    xAxisGroup = svg
        .append('g')
        .attr('transform', `translate(0 ${dim.height - dim.marginBottom})`)
        .call(xAxis)
    yAxis = d3.axisLeft(yScale)
    yAxisGroup = svg
        .append('g')
        .attr('transform', `translate(${dim.marginLeft} 0)`)
        .call(yAxis)

    svg.append('text')
        .attr('class', 'axis-label')
        .attr('y', 0)
        .attr('dy', '1.5em')
        .attr('x', (dim.height - dim.marginBottom - dim.marginTop) / -2 - dim.marginTop)
        .attr('transform', 'rotate(-90)')
        .text('Annual Compensation (USD)')
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('y', dim.height)
        .attr('dy', '-1em')
        .attr('x', dim.marginLeft + (dim.width - dim.marginLeft - dim.marginRight) / 2)
        .text('Years Coding Professionally')
    svg.append('text')
        .attr('class', 'title')
        .attr('y', '0')
        .attr('x', dim.marginLeft + (dim.width - dim.marginLeft - dim.marginRight) / 2)
        .attr('dy', '1.2em')
        .text('Developer Compensation by Gender and Age')
}

function populateScatterplot() {
    const vizData = filteredData.filter(d =>
        d.ConvertedCompYearly
        && d.YearsCodePro
    )

    xScale.domain([0, d3.max(vizData, d => d.YearsCodePro)])
    yScale.domain([0, d3.max(vizData, d => d.ConvertedCompYearly)])
    plot.selectAll()
        .data(vizData)
        .join('circle')
            .attr('class', d => d.IsWoman ? 'target' : '')
            .attr('cx', d => xScale(d.YearsCodePro))
            .attr('cy', d => yScale(d.ConvertedCompYearly))
    xAxisGroup.call(xAxis)
    yAxisGroup.call(yAxis)
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
        createScatterplot(sect)
        populateScatterplot()
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
            filteredData = fullData.filter(d => d.ConvertedCompYearly < 200000)
            populateScatterplot()
        })
})()


// <Professionals|Students|All> <United States|Top 10 Countries|All>