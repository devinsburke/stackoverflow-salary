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
    {
        title: 'Education',
        type: 'select',
        value: null,
        field: 'EdLevel',
    },
    {
        title: 'Age',
        type: 'select',
        value: null,
        field: 'Age',
    },
    {
        title: 'Women Only',
        type: 'toggle',
        value: false,
        field: 'IsWoman'
    },
    {
        title: 'Compensation',
        type: 'range',
        value: 1000000, // Hard coded ceiling
        field: 'ConvertedCompYearly',
        textBefore: 'Up to $',
        textAfter: ' USD'
    },
    {
        title: 'Years Coding Professionally',
        type: 'range',
        value: null,
        field: 'YearsCodePro',
        textBefore: 'Up to ',
        textAfter: ' years'
    }
]

new DataHandler().load('./data.csv').then(async dataHandler => {
    const visualizations = []
    await dataHandler.createParameterElements(
        'aside',
        defaultParameters,
        () => visualizations.forEach(v => v.refresh())
    )

    const main = d3.select('main')
    const sect = main
        .append('section')

    visualizations.push(new Plotter({
        dataAccessor: () => dataHandler.Data,
        refreshCallback: populateScatterplot,
        parentNode: sect,
        cssClass: 'scatterplot',
        title: 'Developer Compensation by Gender and Age',
        layout: defaultLayout,
        x: new Axis('YearsCodePro', 'Years Coding Professionally'),
        y: new Axis('ConvertedCompYearly', 'Annual Compensation (USD)'),
    }))

    await IntroScene()
})

async function IntroScene() {
    const intro = d3.select('#intro')
    await new Promise(r => {
        intro.classed('loading', false)
            .on('click', () => {
                intro.transition()
                    .style('top', '-100vh')
                    .on('end', r)
            })
    })
    intro.style('display', 'none')
}

function Scene1() {

}