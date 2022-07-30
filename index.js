const defaultLayout = {
    height: 200,
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

    d3.selectAll('#scatterplot, #parameters')
        .classed('interactive', true)
}

async function Scene1(dataHandler) {
    dataHandler.resetParameters()
    d3.select('.scatterplot circle').attr('transform', 'translate(0 -200)')
    describe('Scene 1: What is the presence and average compensation of women software developers (full-time) in the US?', 21000)

    dataHandler.setParameter('IsWoman', true, 5000)
    await pause(5000)
    dataHandler.setParameter('IsWoman', false, 6000)
    await pause(6000)

    await annotate(
        'Representing just 7% of full-time developer respondents in the US, women are outnumbered 13:1 by their peers (men, non-binary, etc.)', 
        'ban',
        0,
        4000
    )
    await annotate(
        'And of the women in the profession, they are compensated 17% less than their peers',
        'ban',
        1,
        3000
    )
    await annotate(
        'But women earn $3K more for each year of professional experience than their peers',
        'ban',
        3,
        3000
    )
}

async function Scene2(dataHandler) {
    dataHandler.resetParameters({IsWoman: false})
    dataHandler.refreshData(0)
    describe('Scene 2: Can the pay gap be explained by differences in years of experience? Let\'s see how people in the earliest age group (18-24) are paid.')

    await annotate(
        'To answer this question, we filter to the 18-24 age group, and we adjust compensation and experience ranges to remove outliers',
        'parameter',
        4,
        500
    )
    dataHandler.setParameter('Age', '18-24 years old', 6000)
    pause(6000)
    dataHandler.setParameter('ConvertedCompYearly', 300000, 2000)
    pause(2000)
    dataHandler.setParameter('YearsCodePro', 8, 3000)
    pause(3000)

    await annotate(
        'Pay in this earlier career group is nearly equal for women and their peers, supporting the idea that the pay gap is due to average experience differences',
        'ban',
        1,
        3000
    )
}

async function Scene4() {
    await annotate('We now adjust the age range to 25-34, and raise the compensation and experience ranges to $400K and 17 years, respectively, to accomodate changes in the data while still excluding outliers.',
    '',
    {
        left: '2.5%',
        top: '65%',
        width: '25rem'
    }, 3000)
    await setParameter('Age', '25-34 years old', 1500)
    await setParameter('ConvertedCompYearly', 400000, 2000)
    await setParameter('YearsCodePro', 17, 2000)
    await annotate('By age 25-34, women are compensated 10% less than their peers and no longer earn more for experience.',
    '',
    {
        right: '10%',
        top: '10%',
        width: '20rem'
    }, 3000)
    await annotate('The downward trend continues, with 35-44 year old women earning 17% less than their peers, and 45-54 year olds earning 22% less (not shown).',
    '',
    {
        right: '10%',
        top: '30%',
        width: '25rem'
    }, 3000)
}

async function Scene5() {
    await annotate('Finally, we will review whether the highest levels of education help bridge the compensation gap.',
    '',
    {
        right: '10%',
        top: '10%',
        width: '20rem'
    }, 3000)
    await annotate('We filter on doctoral degree as education level, and reset our other previous filters.',
    '',
    {
        left: '2.5%',
        top: '65%',
        width: '25rem'
    }, 3000)
    await setParameter('EdLevel', 'Other doctoral degree (Ph.D., Ed.D., etc.)', 1000)
    await setParameter('Age', '', 1000)
    await setParameter('ConvertedCompYearly', null, 1000)
    await setParameter('YearsCodePro', null, 1000)
    await annotate('It does not. Unfortunately, women holding doctoral degrees earn 22% less than their peers with similar degrees.',
    '',
    {
        right: '10%',
        top: '30%',
        width: '25rem'
    }, 3000)
    await annotate('And although women appear to get advanced degrees earlier in their careers, this does not explain the discrepency. Women with doctoral degrees barely earn more than half what their peers earn ($11K vs. $21K) per year of experience.',
    '',
    {
        right: '10%',
        top: '45%',
        width: '30rem'
    }, 4000)
}

async function Scene6() {
    await setParameter('EdLevel', '', 1500)
    await annotate('In sum, we have seen that women are underrepresented in software development, are compensated less than their counterparts, and that pay inequality becomes worse with age and experience.',
    '',
    {
        right: '10%',
        top: '10%',
        width: '30rem'
    }, 7000)
    await annotate('Now it\'s your turn. On the next slide, you will be able to adjust the filters on the left yourself, as well as hover over the circles on the chart to see more detail. See what observations you can make.',
    '',
    {
        left: '50%',
        top: '50%',
        width: '35rem'
    }, 5000)
}
