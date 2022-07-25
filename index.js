const defaultLayout = {
    height: 200,
    width: 300,
    marginBottom: 35,
    marginLeft: 60,
    marginRight: 8,
    marginTop: 5,
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
        value: true,
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
        'aside.parameters',
        defaultParameters,
        () => visualizations.forEach(v => v.refresh())
    )

    const main = d3.select('main')
    const sect = main.append('section')
    const bans = d3.select('.bans')
    
    visualizations.push(
        new BAN({
            dataAccessor: () => dataHandler.Data,
            filter: d => d.IsWoman,
            reducer: (b, a) => b + 1,
            cssClass: 'target',
            parentNode: bans,
            title: 'Count',
        }),
        new BAN({
            dataAccessor: () => dataHandler.Data,
            filter: d => !d.IsWoman,
            reducer: (b, a) => b + 1,
            cssClass: '',
            parentNode: bans,
            title: 'Count',
        }),
        new BAN({
            dataAccessor: () => dataHandler.Data.filter(d => d.ConvertedCompYearly),
            filter: d => d.IsWoman,
            reducer: (a,b,i) => a+(b.ConvertedCompYearly-a)/(i+1),
            cssClass: 'target',
            parentNode: bans,
            title: 'Avg. Compensation',
        }),
        new BAN({
            dataAccessor: () => dataHandler.Data.filter(d => d.ConvertedCompYearly),
            filter: d => !d.IsWoman,
            reducer: (a,b,i) => a+(b.ConvertedCompYearly-a)/(i+1),
            cssClass: '',
            parentNode: bans,
            title: 'Avg. Compensation',
        }),
        new BAN({
            dataAccessor: () => dataHandler.Data.filter(d => d.YearsCodePro),
            filter: d => d.IsWoman,
            reducer: (a,b,i) => a+(b.YearsCodePro-a)/(i+1),
            cssClass: 'target',
            parentNode: bans,
            title: 'Avg. Years Coding',
        }),
        new BAN({
            dataAccessor: () => dataHandler.Data.filter(d => d.YearsCodePro),
            filter: d => !d.IsWoman,
            reducer: (a,b,i) => a+(b.YearsCodePro-a)/(i+1),
            cssClass: '',
            parentNode: bans,
            title: 'Avg. Years Coding',
        }),
        new BAN({
            dataAccessor: () => dataHandler.Data.filter(d => d.ConvertedCompYearly && d.YearsCodePro),
            filter: d => d.IsWoman,
            reducer: (a,b,i) => a+((b.ConvertedCompYearly / b.YearsCodePro)-a)/(i+1),
            cssClass: 'target',
            parentNode: bans,
            title: 'Pay:Years Ratio',
        }),
        new BAN({
            dataAccessor: () => dataHandler.Data.filter(d => d.ConvertedCompYearly && d.YearsCodePro),
            filter: d => !d.IsWoman,
            reducer: (a,b,i) => a+((b.ConvertedCompYearly / b.YearsCodePro)-a)/(i+1),
            cssClass: '',
            parentNode: bans,
            title: 'Pay:Years Ratio',
        }),
        new Plotter({
            dataAccessor: () => dataHandler.Data,
            keyAccessor: d => d.ResponseId,
            refreshCallback: populateScatterplot,
            parentNode: sect,
            cssClass: 'scatterplot',
            //title: 'Gender Distribution by Compensation and Experience',
            layout: defaultLayout,
            x: new Axis('YearsCodePro', 'Years Coding Professionally'),
            y: new Axis('ConvertedCompYearly', 'Annual Compensation (USD)'),
        })
    )

    await IntroScene()
    await ExplainFilterScene()
})

async function IntroScene() {
    return new Promise(r => {
        d3.select('#intro')
            .classed('loading', false)
            .on('click', e => {
                d3.select(e.currentTarget)
                    .transition().style('top', '-100vh')
                    .transition().style('display', 'none')
                    .on('end', r)
            })
    })
}

async function ExplainFilterScene() {
    return new Promise(r => {
        d3.select('aside.parameters')
            .transition()
                .duration(200)
                .style('background-color', 'purple')
            .transition()
                .duration(200)
                .style('background-color', null)
                .on('end', r)
    })
}