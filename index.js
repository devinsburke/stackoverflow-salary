const defaultLayout = {
    height: 250,
    width: 400,
    marginBottom: 35,
    marginLeft: 40,
    marginRight: 8,
    marginTop: 5,
}
const defaultParameters = [
    {
        title: 'Status',
        type: 'select',
        value: 'I am a developer by profession',
        default: 'I am a developer by profession',
        field: 'MainBranch',
    },
    {
        title: 'Employment',
        type: 'select',
        value: 'Employed full-time',
        default: 'Employed full-time',
        field: 'Employment',
    },
    {
        title: 'Country',
        type: 'select',
        value: 'United States of America',
        default: 'United States of America',
        field: 'Country',
    },
    {
        title: 'Education',
        type: 'select',
        value: null,
        default: null,
        field: 'EdLevel',
    },
    {
        title: 'Age',
        type: 'select',
        value: null,
        default: null,
        field: 'Age',
    },
    {
        title: 'Women Only',
        type: 'toggle',
        value: true,
        default: true,
        field: 'IsWoman'
    },
    {
        title: 'Compensation',
        type: 'range',
        value: 1000000, // Hard coded ceiling
        default: 1000000, // Hard coded ceiling
        field: 'ConvertedCompYearly',
        textBefore: 'Up to $',
        textAfter: ' USD'
    },
    {
        title: 'Experience',
        type: 'range',
        value: null,
        default: null,
        field: 'YearsCodePro',
        textBefore: 'Up to ',
        textAfter: ' years'
    }
]
let duration = 1500

function formatNumber(num) {
    if (num >= 1000000)
        return (Math.trunc(num/1000000)).toLocaleString() + 'M'
    else if (num >= 1000)
        return (Math.trunc(num/1000)).toLocaleString() + 'K'
    return (Math.trunc(num*10)/10).toLocaleString()
}

window.addEventListener('DOMContentLoaded', async() => {
    const dataHandler = await new DataHandler().load('./data.csv')
    const visualizations = []
    await dataHandler.createParameterElements(
        '#parameters',
        defaultParameters,
        (ms) => visualizations.forEach(v => v.refresh(ms))
    )

    visualizations.push(
        new BAN({
            dataAccessor: () => dataHandler.Data,
            filter: d => d.IsWoman,
            reducer: (b, a) => b + 1,
            cssClass: 'target highlight',
            parentNode: d3.select('#bans'),
            title: 'Women',
        }),
        new BAN({
            dataAccessor: () => dataHandler.Data,
            filter: d => !d.IsWoman,
            reducer: (b, a) => b + 1,
            cssClass: 'highlight',
            parentNode: d3.select('#bans'),
            title: 'Non-Women',
        }),
        new BAN({
            dataAccessor: () => dataHandler.Data.filter(d => d.ConvertedCompYearly),
            filter: d => d.IsWoman,
            reducer: (a,b,i) => a+(b.ConvertedCompYearly-a)/(i+1),
            cssClass: 'target',
            parentNode: d3.select('#bans'),
            title: 'Compensation',
        }),
        new BAN({
            dataAccessor: () => dataHandler.Data.filter(d => d.ConvertedCompYearly),
            filter: d => !d.IsWoman,
            reducer: (a,b,i) => a+(b.ConvertedCompYearly-a)/(i+1),
            cssClass: '',
            parentNode: d3.select('#bans'),
            title: 'Compensation',
        }),
        new BAN({
            dataAccessor: () => dataHandler.Data.filter(d => d.YearsCodePro),
            filter: d => d.IsWoman,
            reducer: (a,b,i) => a+(b.YearsCodePro-a)/(i+1),
            cssClass: 'target',
            parentNode: d3.select('#bans'),
            title: 'Experience (yrs.)',
        }),
        new BAN({
            dataAccessor: () => dataHandler.Data.filter(d => d.YearsCodePro),
            filter: d => !d.IsWoman,
            reducer: (a,b,i) => a+(b.YearsCodePro-a)/(i+1),
            cssClass: '',
            parentNode: d3.select('#bans'),
            title: 'Experience (yrs.)',
        }),
        new BAN({
            dataAccessor: () => dataHandler.Data.filter(d => d.ConvertedCompYearly && d.YearsCodePro),
            filter: d => d.IsWoman,
            reducer: (a,b,i) => a+((b.ConvertedCompYearly / b.YearsCodePro)-a)/(i+1),
            cssClass: 'target',
            parentNode: d3.select('#bans'),
            title: 'Comp : Exp Ratio',
        }),
        new BAN({
            dataAccessor: () => dataHandler.Data.filter(d => d.ConvertedCompYearly && d.YearsCodePro),
            filter: d => !d.IsWoman,
            reducer: (a,b,i) => a+((b.ConvertedCompYearly / b.YearsCodePro)-a)/(i+1),
            cssClass: '',
            parentNode: d3.select('#bans'),
            title: 'Comp : Exp Ratio',
        }),
        new Plotter({
            dataAccessor: () => dataHandler.Data,
            keyAccessor: d => d.ResponseId,
            refreshCallback: populateScatterplot,
            parentNode: d3.select('#scatterplot'),
            cssClass: 'scatterplot',
            //title: 'Gender Distribution by Compensation and Experience',
            layout: defaultLayout,
            x: new Axis('ConvertedCompYearly', 'Annual Compensation (USD)'),
            y: new Axis('YearsCodePro', 'Experience (Years)'),
        })
    )

    await IntroScene()
    await ShowScene(dataHandler)
})

function describe(text, delayMs) {
    d3.select('#description')
        .text(text)
        .classed('hidden', false)
    d3.select('footer')
        .style('--pause', `${delayMs/1000}s`)
        .classed('active', true)
}

async function annotate(text, cssClass, cssIndex, delayMs) {
    d3.select('main')
        .append('div')
            .classed('annotation', true)
            .classed(cssClass, true)
            .style('--annotation-index', cssIndex)
            .style('margin', '1.5rem')
            .text(text)
        .transition()
            .style('margin', '0')
    await new Promise(r => setTimeout(r, delayMs))
}

async function setParameter(name, value, delayMs) {
    const el = document.getElementById(`parameter-${name}`)
    el.value = value || el.getAttribute('max') || ''
    el.dispatchEvent(new Event('change'))
    await new Promise(r => setTimeout(r, delayMs))
}

async function pause(ms) {
    return new Promise(r => setTimeout(r, ms))
}

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

async function ShowScene(dataHandler) {
    const scenes = [
        Scene1,
        Scene2,
        Scene3,
        Scene4,
        Scene5,
        Scene6
    ]

    const navigation = d3.select('#navigation')
    const description = d3.select('#description')

    let i = 0
    while (i < scenes.length) {
        await new Promise(r => setTimeout(r, 1000))

        d3.select('#backButton')
            .text(`Back to Slide ${i}`)
            .style('visibility', i ? 'visible' : 'hidden')
        d3.select('#replayButton')
            .text(`Replay Slide ${i+1}`)
        d3.select('#nextButton')
            .text(i == scenes.length-1 ? 'Done' : `Continue to Slide ${i+2}`)

        await scenes[i](dataHandler)

        d3.select('footer')
            .classed('active', false)
        description.classed('hidden', true)

        const cmd = await new Promise(r => navigation
            .selectAll('button')
            .on('click', e => r(e.currentTarget.getAttribute('data-cmd')))
        )
        d3.selectAll('.annotation').remove()

        if (cmd == 'next')
            i++
        else if (cmd == 'back')
            i--
    }

    d3.select('body')
        .classed('interactive', true)

    describe('Now it\'s your turn. Adjust the filters yourself, and hover over circles on the chart to view detail. See what observations you can make.')
}

async function Scene1(dataHandler) {
    dataHandler.resetParameters()
    d3.select('.scatterplot circle').attr('transform', 'translate(0 -200)')
    describe('Scene 1: What is the presence and average compensation of women software developers (full-time) in the US?', 26000)

    dataHandler.setParameter('IsWoman', true, 5000)
    await pause(5000)
    dataHandler.setParameter('IsWoman', false, 6000)
    await pause(6000)

    await annotate('At just 7% of full-time US developers, women are outnumbered 13:1', 'ban', 0, 4000)
    await annotate('Women developers are compensated 17% less than their peers', 'ban', 1, 3000)
    await annotate('But women earn $3K more per year as a professional developer', 'ban', 3, 5000)

    await annotate('Most data is in first 1/3 of the compensation axis, meaning we should zoom the data going forward', 'chart', 0, 5000)
}

async function Scene2(dataHandler) {
    dataHandler.resetParameters({IsWoman: false})
    dataHandler.refreshData(0)
    describe('Scene 2: Can the pay gap be explained by differences in experience? Let\'s see how developers in the earliest age group (18-24) are paid.', 12000)

    await pause(1000)
    await annotate('We filter age and zoom into compensation and experience', 'parameter', 4, 100)
    dataHandler.setParameter('Age', '18-24 years old', 2000)
    await pause(2000)
    dataHandler.setParameter('ConvertedCompYearly', 300000, 2000)
    await pause(2000)
    dataHandler.setParameter('YearsCodePro', 8, 2000)
    await pause(2000)

    await annotate('Young people are paid similarly, hinting that experience differences may explain pay gaps', 'ban', 1, 4000)
}

async function Scene3(dataHandler) {
    dataHandler.resetParameters({
        IsWoman: false,
        Age: '18-24 years old',
        ConvertedCompYearly: 300000,
        YearsCodePro: 8,
    })
    dataHandler.refreshData(0)
    describe('Scene 3: Do increased age / experience levels maintain similar pay between genders?', 16000)

    await pause(1000)
    await annotate('We filter age and zoom into compensation and experience', 'parameter', 4, 1000)
    dataHandler.setParameter('Age', '25-34 years old', 2000)
    await pause(2000)
    dataHandler.setParameter('ConvertedCompYearly', 400000, 2000)
    await pause(2000)
    dataHandler.setParameter('YearsCodePro', 17, 2000)
    await pause(2000)

    await annotate('By age 25-34, women are paid 10% less than their peers', 'ban', 1, 3000)
    await annotate('...Even though average experience levels are similar', 'ban', 2, 3000)
    await annotate('As well, 25-34 year old women no longer earn more for experience', 'ban', 3, 3000)
}

async function Scene4(dataHandler) {
    dataHandler.resetParameters({
        IsWoman: false,
        Age: '25-34 years old',
        ConvertedCompYearly: 400000,
        YearsCodePro: 17,
    })
    dataHandler.refreshData(0)
    describe('Scene 4: Does the pay gap increase or decrease for mid-to-late-career age (45-54) women?', 10000)

    await pause(1000)
    await annotate('We filter age and zoom into compensation and experience', 'parameter', 4, 1000)
    dataHandler.setParameter('Age', '45-54 years old', 2000)
    await pause(2000)
    dataHandler.setParameter('YearsCodePro', 40, 2000)
    await pause(2000)

    await annotate('45-54 year olds earn 20% less than their peers', 'ban', 1, 4000)
}

async function Scene5(dataHandler) {
    dataHandler.resetParameters({
        IsWoman: false,
        Age: '45-54 years old',
        ConvertedCompYearly: 400000,
        YearsCodePro: 40,
    })
    dataHandler.refreshData(0)
    describe('Scene 5: Does education (at the highest level) help bridge the compensation gap?', 18000)

    await pause(1000)
    await annotate('We filter education to doctoral degrees', 'parameter', 3, 1000)
    dataHandler.setParameter('EdLevel', 'Other doctoral degree (Ph.D., Ed.D., etc.)', 2000)
    await pause(2000)
    dataHandler.setParameter('Age', null, 2000)
    await pause(2000)

    await annotate('Education does not bridge the gap, as women with doctorates earn 22% less than peers with doctorates', 'ban', 1, 4000)
    await annotate('In this category, women have more experience than their peers, making the lower pay more questionable', 'ban', 2, 4000)
    await annotate('Women with doctorates only earn half what their peers earn ($11K vs. $21K) per year of experience', 'ban', 3, 4000)
}

async function Scene6(dataHandler) {
    dataHandler.resetParameters({
        ConvertedCompYearly: 400000,
        EdLevel: 'Other doctoral degree (Ph.D., Ed.D., etc.)',
        IsWoman: false,
        YearsCodePro: 40,
    })
    dataHandler.refreshData(0)
    describe('Scene 6: In sum, we learned...', 23000)

    await pause(1000)
    dataHandler.setParameter('EdLevel', null, 2000)
    await pause(2000)
    dataHandler.setParameter('ConvertedCompYearly', null, 2000)
    await pause(2000)
    dataHandler.setParameter('YearsCodePro', null, 2000)
    await pause(2000)

    await annotate('...that women are significantly underrepresented in software development', 'ban', 0, 4000)
    await annotate('...that women are consistently compensated less than their peers', 'ban', 1, 4000)
    await annotate('...that pay inequality becomes worse with age, experience, and education', 'chart', 3, 4000)
    await annotate('Now it\'s your turn. On the next slide, adjust these filters yourself, and hover over circles on the chart to see detail. See what observations you can make.', 'parameter', 5, 4000)
}
