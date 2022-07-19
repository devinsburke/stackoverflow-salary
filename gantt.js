async function processData() {
    const sortOrder = {
        'Implementation': 1,
        'Integration': 2,
        'Development': 3,
        'Automation': 4,
        'Process': 5,
        'Workflow': 6,
        'Analytics': 7,
    }
    const groups = {}
    const years = {}
    let groupCount = 0

    await d3.csv('./portfolio.csv', r => {
        if (!r['Start Date'] || !r['End Date'] || !r.Type)
            return
        r['Start Date'] = new Date(r['Start Date'])
        r['End Date'] = new Date(r['End Date'])
        years[r['Start Date'].getFullYear()] = undefined
        years[r['End Date'].getFullYear()] = undefined
        const group = groups[r.Type] || []
        let groupRow = group.find(row => row.slice(-1)[0]['End Date'] <= r['Start Date'])
        if (!groupRow) {
            groupRow = []
            group.push(groupRow)
            ++groupCount
        }
        groupRow.push(r)
        groups[r.Type] = group
    })
    const data = [].concat(...Object
        .entries(groups)
        .sort((a, b) => sortOrder[a[0]] - sortOrder[b[0]])
        .map(g => g[1])
    )

    const yearList = Object.keys(years)

    const height = 1
    const marginBottom = height * 0.3
    const groupHeight = (height - marginBottom) / groupCount
    const width = 3
    const marginLeft = width * 0.1
    const radius = 0.035 * width
    const monthWidth = (width - marginLeft) / 12 / yearList.length

    const timeline = d3.select('main').append('section').attr('class', 'timeline')
    const svg = timeline.append('svg').attr('viewBox', [0, 0, width, height])
    drawRoad(svg)

    const ganttz = svg.append('g').selectAll().data(data)
    ganttz
        .join('text')
            .text(d => d[0].Type)
            .attr('class', d => d[0].Type.toLowerCase())
            .attr('font-size', '0.3%')
            .attr('y', (_, i) => i*groupHeight)
    ganttz
        .join('g')
            .attr('class', d => d[0].Type.toLowerCase())
            .attr('transform', (_, i) => `translate(${marginLeft} ${i * groupHeight})`)
            .selectAll()
        .data(d => d).enter()
        .append('rect')
            .attr('x', d => monthWidth * monthDiff(d['Start Date'], new Date('1/1/2013')))
            .attr('width', d => monthWidth * monthDiff(d['End Date'], d['Start Date']))
            .attr('height', groupHeight*0.9)
            .attr('rx', '1%')
            .attr('stroke', '#0006')
            .attr('stroke-width', '0.1%')

    const dater = svg.append('g').selectAll().data(yearList)
        .join('g')
        .attr('transform', (_,i) => `translate(${(marginLeft + i*monthWidth*12)}, ${0.85})`)
    dater.append('circle')
        .attr('r', radius)
        .attr('stroke', '#0009')
        .attr('stroke-width', '0.15%')
        .attr('fill', d => d.color)
        .attr('fill', '#999')
        dater.append('circle')
        .attr('r', radius)
        .attr('stroke', '#0009')
        .attr('stroke-width', '0.15%')
        .attr('fill', d => d.color)
        .attr('fill', '#999')
    dater.append('circle')
        .attr('r', radius*0.75)
        .attr('fill', '#fefefe')
    dater.append('text')
        .text(d => d['Start Date'])
        .attr('font-size', '0.35%')
        .attr('stroke', 'transparent')
        .attr('text-anchor', 'middle')
        .attr('dy', '1%')
}

function drawRoad(svg) {
    const road = svg.append('g')
        .attr('class', 'road')
        .attr('fill', '#222')
        .attr('stroke', 'white')
        .attr('stroke-width', '0.15%')
    road.append('rect')
        .attr('x', '0%')
        .attr('width', '100%')
        .attr('y', '94.5%')
        .attr('height', '4%')
    road.append('line')
        .attr('x1', '0%')
        .attr('x2', '100%')
        .attr('y1', '95%')
        .attr('y2', '95%')
    road.append('line')
        .attr('stroke-dasharray', '1%')
        .attr('x1', '0%')
        .attr('x2', '100%')
        .attr('y1', '96.5%')
        .attr('y2', '96.5%')
    road.append('line')
        .attr('x1', '0%')
        .attr('x2', '100%')
        .attr('y1', '98%')
        .attr('y2', '98%')
    return road
}

function monthDiff(toDate, fromDate) {
    return toDate.getMonth() - fromDate.getMonth() + 12 * (toDate.getFullYear() - fromDate.getFullYear())
}

(async () => {
    await processData()
})()