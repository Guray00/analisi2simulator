require('dotenv').config() 
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

async function listTeoremi(){
    data = await (await readFile('./source/teoremi.txt',"utf8"))
    return data
}

async function listDefinizioni(){
    data = await (await readFile('./source/definizioni.txt',"utf8"))
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
    console.log('Response time: %sms', ms)
})

const commands = Telegraf.Extra
    .markdown()
    .markup((m) => m.keyboard([
        [m.callbackButton('Simulazione', 'simulazione')],
        [m.callbackButton('Definizione', 'monkeyuser'), m.callbackButton('Teorema', 'commitstrip')], 
        [m.callbackButton('Lista Def', 'Lista def'), m.callbackButton('Lista Th', 'Lista def')],
        [m.callbackButton("Segnala Definizione / Teorema")]
    ]))



bot.start((ctx) => ctx.reply('Welcome', commands))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))

//commands

bot.command("addth", (ctx)=>{
    //console.log(ctx.message.from.id)
    if(ctx.message.from.id != "163506608") return
    fs.appendFile('./source/teoremi.txt', "\n"+ctx.message.text.replace("/addth ", ""), function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
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

bot.command("listaTeoremi", async (ctx) =>{
    let data = await listTeoremi()
    ctx.replyWithHTML("<b>Teoremi</b>\n"+data)
})

bot.command("listaDefinizioni", async (ctx) =>{
    let data = await listDefinizioni()
    ctx.replyWithHTML("<b>Definizioni</b>\n"+data)
})




/*
    hears

*/

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
    ctx.reply(await getTeorema())
})

bot.hears("Lista Def", async (ctx) =>{
    let data = await listDefinizioni()
    ctx.replyWithHTML("<b>Definizioni</b>\n"+data)
})

bot.hears("Segnala Definizione / Teorema", async (ctx) =>{
    ctx.reply("Ciao! Visto che anche noi stiamo studiando analisi2, mettere qui un trigger implicava studiare meno analisi... Quindi, please puoi scrivere a @gray00 o sul gruppo di @inginfunipi segnalando cosa manca? Grazie <3");
})

bot.launch()

