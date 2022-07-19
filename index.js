let sectionIndex = 0

async function processData() {
    const data = await d3.csv('./data.csv', r => ({
        MainBranch: r.MainBranch,
        Employment: r.Employment,
        Country: r.Country,
        US_State: r.US_State,
        EdLevel: r.EdLevel,
        YearsCodePro: r.YearsCodePro,
        Age: r.Age,
        Gender: r.Gender,
        ConvertedCompYearly: r.ConvertedCompYearly,
        IsMan: r.Gender.includes('Man'),
        IsWoman: r.Gender.includes('Woman')
    }))
    const relevantData = data.filter(r => 
        r.MainBranch == 'I am a developer by profession'
        && r.Employment == 'Employed full-time'
        && r.Country == 'United States of America'
        && r.ConvertedCompYearly != 'NA'
        && (r.IsMan || r.IsWoman)
    )
    const manData = relevantData.filter(d => d.IsMan)
    const womanData = relevantData.filter(d => d.IsWoman)
    const nonWomanData = relevantData.filter(d => !d.IsWoman)

    const donutArc = d3.arc().innerRadius(0.3).outerRadius(0.5)
    
    addSection('Intro', [
        'Each year, Stack Overflow hosts a survey asking developers numerous questions about their careers and preferences. Amongst the information collected is employment, geography, education, experience, age, gender identity, and compensation.',
        'As Stack Overflow is by far the largest Q&A social network for programmers, these surveys should be excellent sample datasets from which to aggregate accurate information about developers in general.',
        'Unfortunately, the latest Stack Overflow developer survey dataset available (2021) gives concerning insights about gender and compensation amongst professional developers in the United States.'
    ])

    addSection('Gender Presence and Compensation', [
        'Test test test'
    ], sect => {
        const pie = d3.pie()
            .sort(null)
            .startAngle(Math.PI)([
                womanData.length / relevantData.length,
                (relevantData.length - womanData.length) / relevantData.length
            ])

        const portions = sect
            .append('svg')
                .attr('class', 'measure')
                .attr('viewBox', '0 0 1 0.5')
            .append('g')
                .selectAll()
                .data(pie)
        portions
            .join('path')
                .attr('d', donutArc)
        portions
            .join('text')
                .text('hi')
                .attr('transform', d => donutArc.centroid(d))
                .style('text-anchor', 'middle')
                .style('font-size', '20%')
    })
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
//; it's not age; women start out at lower salaries than men
//; women are even slightly more educated than men
//; women are more likely to be employed than men
//---
//Scatterplot

(async() => {
    await processData();

    d3.select('aside').append('button')
        .text('Previous')
        .attr('id','previous')
        .on('click', _ => document.body.setAttribute('data-index', parseInt(document.body.getAttribute('data-index')) - 1))
    d3.select('aside').append('button')
        .text('Next')
        .attr('id','next')
        .on('click', _ => document.body.setAttribute('data-index', parseInt(document.body.getAttribute('data-index')) + 1))
})()


// <Professionals|Students|All> <United States|Top 10 Countries|All>