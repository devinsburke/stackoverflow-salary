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
        title: 'Female Only',
        type: 'toggle',
        value: true,
        field: 'IsWoman'
    }
]

new DataHandler().load('./data.csv').then(async dataHandler => {
    const visualizations = []
    await dataHandler.createParameterElements(
        'aside',
        defaultParameters,
        () => visualizations.forEach(v => v.refresh())
    )

    const intro = document.getElementById('intro')
    intro.classList.remove('loading')
    intro.addEventListener('click', e => {
        intro.classList.add('hidden')

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
    })
})