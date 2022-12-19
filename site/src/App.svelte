<script>
    import { onMount } from 'svelte'
    import { fade, fly } from 'svelte/transition'
    import { parse as dateParse, format as formatDate } from 'date-fns'

    export let title

    let loading = false

    let forecastList = []    

    onMount(async () => {
        loading = true
        const response = await fetch('https://aadhou6vql.execute-api.eu-west-1.amazonaws.com/Prod/forecast/')
        forecastList = await response.json()
        forecastList = forecastList.map((f) => {
            f.datetime = dateParse(f.datetime, 'yyyy-MM-dd HH:mm:ss', new Date())
            f.weekday = formatDate(f.datetime, 'cccc')
            f.hour = formatDate(f.datetime, 'HH:mm')
            f.primarySwellHeight = Number(f.primarySwellHeight).toFixed(1)
            f.primarySwellPeriod = Number(f.primarySwellPeriod).toFixed(1)
            f.windVelocity = Number(f.windVelocity).toFixed(1)
            return f
        })
        loading = false
    })

    function flipDirection(direction) {
        direction = direction.split('-')[0]
        if (direction<180) {
            return direction+180
        }
        else {
            return direction-180
        }
    }

    function epicConditions(forecast) {
        return (
            (forecast.primarySwellHeight >= 0.6 && forecast.primarySwellPeriod >= 6)
            ||
            (forecast.primarySwellHeight >= 0.5 && forecast.primarySwellPeriod >= 7)
        )
    }

</script>

<div class="container">
    <div>
        <h1>{title}</h1>
    </div>

{#if loading} 
    <div class="spinner-container" in:fade out:fade={{delay:300, duration:300}}>
        <div class="spinner-wave">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
    </div>
{:else}
    <div in:fly={{delay:900, y:1000}} class="table">
    {#each forecastList as forecast, index}
        {#if index > 1 && forecastList[index].weekday !== forecastList[index-1].weekday }
            <div class="weekday">{forecastList[index].weekday}</div>
        {:else if index == 0}
            <div class="weekday">{forecastList[index].weekday}</div>
        {/if}
        <div class="row" class:green-light={epicConditions(forecast)}>
            <div class="ceil text-bold text-bigger">
                <div>
                    {forecast.hour}
                </div>
                <div class="text-small">{forecast.weekday}</div>
            </div>
            
            <div class="ceil ceil-row text-bold text-biggest text-blue">
                <span>{forecast.primarySwellHeight}</span><span class="unit">m</span>
            </div>
            <div class="ceil ceil-row text-bold text-bigger align-fonts text-grey">
                <span>{forecast.primarySwellPeriod}</span><span class="unit">s</span>
            </div>
            <div class="ceil">
                <div>
                    <svg class="arrow" viewBox="0 0 50 50" style="transform:rotate({flipDirection(forecast.primarySwellDirection)}deg)">
                        <polygon points="25,6 15,40, 25,35, 35,40" style="fill:rgba(0,105,148,1)" />
                    </svg>
                </div>
                <div class="text-bold">
                    {forecast.primarySwellDirection.split('-')[1]}
                </div>
            </div>

            <div class="ceil">
                <div>
                    <svg class="arrow" viewBox="0 0 50 50"
                        style="transform:rotate({flipDirection(forecast.windDirection)}deg)"
                        class:green={forecast.windVelocity < 5}
                        class:yellow={forecast.windVelocity < 10}
                        class:red={forecast.windVelocity >= 10}>
                        <polygon points="25,6 15,40, 25,35, 35,40" />
                    </svg>
                </div>
                <div class="text-bold">{forecast.windDirection.split('-')[1]}</div>
                
            </div>
        </div>
        <div class="subrow" class:green-light={epicConditions(forecast)}>
            <div class="ceil"><div class="text-small text-grey">{forecast.windVelocity} m/s</div></div>
        </div>
        
    {/each}
    </div>
{/if}
</div>

<style>
    .container {
        font-size: 1rem;
        padding:2rem;
        font-family: Arial, Helvetica, sans-serif;
        text-align: center;
    }

    .spinner-container {
        margin-top:10rem;
    }

    h1 {
        text-transform: uppercase;
        color:rgba(0,105,148,1);
    }

    .table {
        margin:0 auto;
        width:576px;
        display: flex;
        flex-direction: column
    }

    .weekday {
        height: 4rem;
        background-color: rgba(0,105,148,1);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.4rem;
        font-weight: bolder;
        margin-bottom: 2rem;
        text-transform: uppercase;
    }

    .row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    .subrow {
        display: flex;
        flex-direction: row;
        justify-content: end;
        padding-bottom: 1rem;
        margin-bottom: 2rem;
        border-bottom: 1px solid #e4e4e4;
    }

    .ceil {
        height: 100%;
        width:16.67%;
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center
    }

    .ceil-row {
        flex-direction: row;
        justify-content: center;
    }

    .align-fonts {
        padding-top: 0.2rem;
    }

    .arrow {
        width:65px
    }

    .text-bold {
        font-weight: bolder;
    }

    .text-small {
        font-size: 0.8rem
    }

    .text-bigger {
        font-size: 1.5rem
    }

    .text-biggest {
        font-size: 1.6rem
    }

    .unit {
        margin-left:0.2rem
    }

    .text-blue {
        color: rgba(0,105,148,1)
    }

    .text-grey {
        color: #6c6c6c
    }

    .red {
        fill: #A21E4D;
    }

    .yellow {
        fill: #D8AA00;
    }

    .green {
        fill: #95A844;
    }

    .green-light {
        background-color: #f5fbdc;
    }

    .spinner-wave {
        margin: 10px auto;
        width: 100px;
        height: 50px;
        text-align: center;
    }
    .spinner-wave > div {
        background-color: rgba(0,105,148,1);;
        height: 100%;
        width: 6px;
        display: inline-block;

        -webkit-animation: wave 1.6s infinite ease-in-out;
        -moz-animation: wave 1.6s infinite ease-in-out;
        -o-animation: wave 1.6s infinite ease-in-out;
        -ms-animation: wave 1.6s infinite ease-in-out;
        animation: wave 1.6s infinite ease-in-out;
    }

    .spinner-wave div:nth-child(2) {
        -webkit-animation-delay: -1.4s;
        -moz-animation-delay: -1.4s;
        -ms-animation-delay: -1.4s;
        -o-animation-delay: -1.4s;
        animation-delay: -1.4s;
    }

    .spinner-wave div:nth-child(3) {
        -webkit-animation-delay: -1.2s;
        -moz-animation-delay: -1.2s;
        -ms-animation-delay: -1.2s;
        -o-animation-delay: -1.2s;
        animation-delay: -1.2s;
    }

    .spinner-wave div:nth-child(4) {
        -webkit-animation-delay: -1.0s;
        -moz-animation-delay: -1.0s;
        -ms-animation-delay: -1.0s;
        -o-animation-delay: -1.0s;
        animation-delay: -1.0s;
    }

    .spinner-wave div:nth-child(5) {
        -webkit-animation-delay: -0.8s;
        -moz-animation-delay: -0.8s;
        -ms-animation-delay: -0.8s;
        -o-animation-delay: -0.8s;
        animation-delay: -0.8s;
    }

    @-webkit-keyframes wave {
        0%, 40%, 100% { -webkit-transform: scaleY(0.4) }
        20% { -webkit-transform: scaleY(1.0) }
    }
    @-moz-keyframes wave {
        0%, 40%, 100% { transform: scaleY(0.4); }
        20% { transform: scaleY(1.0); }
    }
    @-o-keyframes wave {
        0%, 40%, 100% { transform: scaleY(0.4); }
        20% { transform: scaleY(1.0); }
    }
    @-ms-keyframes wave {
        0%, 40%, 100% { transform: scaleY(0.4); }
        20% { transform: scaleY(1.0); }
    }
    @keyframes wave {
        0%, 40%, 100% { transform: scaleY(0.4); }
        20% { transform: scaleY(1.0); }
    }

    @media (max-width: 992px) {
        .container {
            font-size: 2rem;
        }
        .table {
            width: 100%
        }
        
        .weekday {
            height: 8rem;
            font-size: 2.8rem;
        }

        .text-small {
            font-size: 1.6rem
        }
        
        .text-bigger {
            font-size: 3rem
        }
        
        .text-biggest {
            font-size: 3.2rem
        }

        .align-fonts {
            padding-top: 0.1rem;
        }

        .arrow {
            width:100%
        }

        .spinner-wave {
            width: 100px;
            height: 100px;
        }
        .spinner-wave > div {
            width: 10px;
        }
    }
    
</style>
