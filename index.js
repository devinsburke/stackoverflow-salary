const defaultLayout = {
    height: 200,
    width: 300,
    marginBottom: 40,
    marginLeft: 70,
    marginRight: 10,
    marginTop: 30,
}
const defaultParameters = [
    {
        title: 'Status',
        type: 'select',
        value: 'I am a developer by profession',
        field: 'MainBranch',
    },
    {
        title: 'Employment',
        type: 'select',
        value: 'Employed full-time',
        field: 'Employment',
    },
    {
        title: 'Country',
        type: 'select',
        value: 'United States of America',
        field: 'Country',
    },
]

let sectionIndex = 0

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

(async() => {
    const dataHandler = await new DataHandler().load('./data.csv')
    dataHandler.createParameterElements('aside', defaultParameters)

    addSection('Intro', [
        'Each year, Stack Overflow hosts a survey asking developers numerous questions about their careers and preferences. Amongst the information collected is employment, geography, education, experience, age, gender identity, and compensation.',
        'As Stack Overflow is by far the largest Q&A social network for programmers, these surveys should be excellent sample datasets from which to aggregate accurate information about developers in general.',
        'Unfortunately, the latest Stack Overflow developer survey dataset available (2021) gives concerning insights about gender and compensation amongst professional developers in the United States.'
    ])
    
    addSection('Gender Representation and Compensation', [
        'Test test test'
    ], sect => {
        new Plotter({
            data: {
                dataAccessor: () => dataHandler.Data,
                xValueAccessor: d => d.YearsCodePro,
                yValueAccessor: d => d.ConvertedCompYearly,
            },
            refreshFn: populateScatterplot,
            parentNode: sect,
            cssClass: 'scatterplot',
            layout: defaultLayout,
            axes: {
                title: 'Developer Compensation by Gender and Age',
                xLabel: 'Years Coding Professionally',
                yLabel: 'Annual Compensation (USD)'
            },
        })
    })

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
            dataHandler.Data = dataHandler.Data.filter(d => d.YearsCodePro <= 10)
            scatterplot.refresh()
        })
})()
