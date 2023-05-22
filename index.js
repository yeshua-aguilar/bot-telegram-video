const axios = require('axios');
const cheerio = require('cheerio');
const { Telegraf } = require('telegraf');

const bot = new Telegraf('6281038868:AAGjvgLpSb2D3mdU_SaM-FiK0uUPuWBUvVE');

bot.start((ctx) => ctx.reply('¡Hola! Envíame un enlace de video para descargar.'));

bot.on('text', async (ctx) => {
  const message = ctx.message.text;
  const videoUrl = extractVideoUrl(message);

  if (videoUrl) {
    try {
      const videoData = await downloadVideo(videoUrl);
      ctx.replyWithVideo({ source: videoData });
    } catch (error) {
      console.error(error);
      ctx.reply('Lo siento, no pude descargar el video.');
    }
  } else {
    ctx.reply('Lo siento, no pude encontrar un enlace de video en tu mensaje.');
  }
});

function extractVideoUrl(message) {
  const regex = /(https?:\/\/[^\s]+)/g;
  const matches = message.match(regex);

  if (matches) {
    for (const match of matches) {
      if (match.includes('youtube') || match.includes('vimeo')) {
        return match;
      }
    }
  }

  return null;
}

async function downloadVideo(url) {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const videoUrl = $('meta[property="og:video"]').attr('content');
  const videoData = await axios.get(videoUrl, { responseType: 'stream' });
  return videoData.data;
}


bot.launch();
