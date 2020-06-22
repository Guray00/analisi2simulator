require('dotenv').config();
const fs = require('fs');
const util = require('util');

const { Telegraf } = require('telegraf')
const readFile = util.promisify(fs.readFile);
const extra = require('telegraf/extra')
const markup = extra.markdown()



async function getDefinition(){
    data = await (await readFile('./source/definizioni.txt',"utf8")).split("\n")
    let n = Math.floor(Math.random() * data.length)

    while (data[n] == "" || data[n]==" " || data[n]=="\n") n = Math.floor(Math.random() * data.length)

    return data [n];
}


async function getTeorema(){
    data = await (await readFile('./source/teoremi.txt',"utf8")).split("\n")
    let n = Math.floor(Math.random() * data.length)

    while (data[n] == "" || data[n]==" " || data[n]=="\n") n = Math.floor(Math.random() * data.length)
    return data [n];
}

async function getEsercizio(){
    data = await (await readFile('./source/esercizi.txt',"utf8")).split("\n")
    let n = Math.floor(Math.random() * data.length)

    while (data[n] == "" || data[n]==" " || data[n]=="\n") n = Math.floor(Math.random() * data.length)
    return data [n];
}


async function listTeoremi(){
    data = await (await readFile('./source/teoremi.txt',"utf8"))
    data+="\n\nI teoremi segnati con * sono stati chiesti all'orale (in aggiornamento)."
    return data
}

async function listDefinizioni(){
    data = await (await readFile('./source/definizioni.txt',"utf8"))
    data+="\n\nLe definizioni segnate con * sono state chiese all'orale (in aggiornamento)."
    return data
}

async function listEsercizi(){
    data = await (await readFile('./source/esercizi.txt',"utf8"))
    return data
}

async function simulazione(){
    let definizioni=[]
    for (let i = 0; i < 5; i++){
        let tmp = await getDefinition()
        while (definizioni.indexOf(tmp) != -1) {
            tmp = await getDefinition()
        }
        definizioni.push(tmp)
    }

    let output = "<b>Definizioni</b>\n"

    definizioni.forEach((i)=>{
        output+="<b>-</b> "+i+"\n"
    })

    output+="\n <b>Esercizio</b>\n<b>-</b> " +(await getEsercizio() + "\n")


    output+="\n <b>Teorema</b>\n<b>-</b> " +(await getTeorema())


    return output
}



/*********************************************
 * 
 *          PROGRAM STARTS HERE
 * 
 *********************************************/



const bot = new Telegraf(process.env.BOT_TOKEN)


bot.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const ms = new Date() - start
    
    let usr = ctx.message.from.username

    if (usr == undefined) usr = "id->"+ctx.message.from.id
    else usr = "@"+usr
    console.log('Response time: %sms by '+usr, ms)

    let data = await (await readFile('./.users',"utf8")).split("\n")

    if(data.indexOf(usr) == -1){
        fs.appendFile('./.users', "\n"+usr, function (err) {
            if (err) throw err;
            console.log('New user!');
        });
    }
    
})

const commands = Telegraf.Extra
    .markdown()
    .markup((m) => m.keyboard([
        [m.callbackButton('Simulazione')],
        [m.callbackButton('Definizione'), m.callbackButton('Teorema')], 
        [m.callbackButton('Lista Def'), m.callbackButton('Lista Th'), m.callbackButton('Lista Es')],
        [m.callbackButton("Segnala Definizione / Teorema")]
    ]))



bot.start((ctx) => ctx.reply('Ciao! Benvenuto, seleziona un comando dalla tastiera o usando quelli disponibili preceduti da "/"\n\nTi ricordo che questo bot è frutto dell\'opera volontaria degli studenti, quindi è probabile che manchi del materiale, in tal caso segnalalo per rendere il tutto più funzionale!', commands))
bot.help((ctx) => ctx.reply('Per eseguire un comando utilizza la tastiera o digita /+comando', commands))

//commands

bot.command("users", async(ctx)=>{
    //console.log(ctx.message.from.id)
    if(ctx.message.from.id != "163506608") return
    let data = await (await readFile('./.users',"utf8"))

    let size = data.split("\n").length - 1
    ctx.replyWithHTML("<b>Users - "+size+"</b>\n"+data)
})


bot.command("definizione", async (ctx) =>{
    ctx.reply(await getDefinition(), commands)
})

bot.command("teorema", async (ctx) =>{
    ctx.reply(await getTeorema(), commands)
})


bot.command("simulazione", async (ctx) =>{
    let data = await simulazione()
    ctx.replyWithHTML(data)
})

bot.command("listath", async (ctx) =>{
    let data = await listTeoremi()
    ctx.replyWithHTML("<b>Teoremi</b>\n"+data)
})

bot.command("listadef", async (ctx) =>{
    let data = await listDefinizioni()
    ctx.replyWithHTML("<b>Definizioni</b>\n"+data)
})

bot.command("listaes", async (ctx) =>{
    let data = await listEsercizi()
    ctx.replyWithHTML("<b>Esercizi</b>\n"+data)
})




/********************************************
    hears

********************************************/ 

bot.hears("Definizione", async (ctx) =>{
    ctx.reply(await getDefinition())
})


bot.hears("Simulazione", async (ctx) =>{
    let data = await simulazione()
    ctx.replyWithHTML(data)
})

bot.hears("Lista Th", async (ctx) =>{
    let data = await listTeoremi()
    ctx.replyWithHTML("<b>Teoremi</b>\n"+data)
})

bot.hears("Teorema", async (ctx) =>{
    ctx.reply(await getTeorema(), commands)
})

bot.hears("Lista Def", async (ctx) =>{
    let data = await listDefinizioni()
    ctx.replyWithHTML("<b>Definizioni</b>\n"+data)
})


bot.hears("Lista Es", async (ctx) =>{
    let data = await listEsercizi()
    ctx.replyWithHTML("<b>Esercizi</b>\n"+data)
})

bot.hears("Segnala Definizione / Teorema", async (ctx) =>{
    ctx.reply("Ciao! Visto che anche noi stiamo studiando analisi2, mettere qui un trigger implicava studiare meno analisi... Quindi, please puoi scrivere a @gray00 o sul gruppo di @inginfunipi segnalando cosa manca? Grazie ❤️", commands);
})

bot.launch()

