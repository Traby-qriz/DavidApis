import cheerio from "cheerio";

const BASE_URL = "https://www.dafont.com";
const URL_THEME = "/themes.php";
const URL_THEME_SEARCH = "/theme.php";
const URL_AUTHOR = "/authors.php";
const URL_TOP = "/top.php";
const URL_NEW = "/new.php";
const URL_SEARCH = "/search.php";
const REG_FL = /\s?-\s?(\w+)\s?\w+\s?\w+/i;
const MAX_WORKERS = 5;

let headersList = {
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7,ru;q=0.6",
  "Cache-Control": "max-age=0",
  "Connection": "keep-alive",
  "Host": "www.dafont.com",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
  "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"'
}

async function req(url, method = "GET", data = null, params = null) {
  try {
    let pUrl;
    if (params) {
      const cUrl = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        cUrl.append(k, v);
      })
      pUrl = url + "?" + cUrl.toString();
    } else {
      pUrl = url;
    }

    return await fetch(pUrl, {
      method,
      headers: headersList,
      ...(data ? {
        body: data
      } : {})
    })
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function taskQueue(task, data, size) {
  const active = new Set();
  const results = [];
  let index = 0;

  return new Promise(async (resolve, reject) => {
    while (data.length > index || active.size > 0) {
      while (active.size < size && index < data.length) {
        const pTask = task(data[index][1]);
        active.add(pTask);
        index++
      }

      const ff = await Promise.all(active);
      results.push(...ff);
      active.clear();
    }

    resolve(results);
  })
}

async function GetRecently(url = null, eq = 1) {
  let results = [];

  const re = await req(url ? url : BASE_URL);
  const ct = await re.text();
  const $ = cheerio.load(ct);
  $(".lv1left.dfbg").each((_, el) => {
    const name = eq == 0 ? $(el).first().text().trim().split(" by ")[0].trim().replace(/\s?à\s?€\s?|\s?à\s?|\s?€\s?/gi, "") : $(el).find("strong").text().trim();
    const aut = $(el).find("a").eq(Number(eq)).text().trim();

    results.push({
      name: name || null,
      author: aut || null,
    })
  })
  $(".lv1right.dfbg").each((i, el) => {
    const ht = $(el).find("a");
    const mt = ht.eq(0).text().trim();
    const t = ht.eq(1).text().trim();

    if (results[i]) {
      results[i]["m_theme"] = mt || null;
      results[i]["theme"] = t || null;
    }
  })
  $("[class=\"lv2right\"]").each((i, el) => {
    const ht = $(el).find("span.light").text().trim();
    const cp = $(el).find("a.tdn.help.black").text().trim();
    const fl = $(el).text().trim().match(REG_FL);

    if (results[i]) {
      results[i]["downloads"] = ht || null;
      results[i]["copyright"] = cp || null;
      fl ? results[i]["files"] = Number(fl[1]) : results[i]["files"] = null;
    }
  })
  $("[class=\"dlbox\"]").each((i, el) => {
    const ht = $(el).find("a.dl").attr("href").trim();

    if (results[i]) {
      results[i]["dl_link"] = "https:" + ht || null;
    }
  })
  $(".preview[style]").each((i, el) => {
    const ht = $(el).find("a").attr("href").trim();

    if (results[i]) {
      results[i]["font_link"] = BASE_URL + "/" + ht || null;
    }
  })

  if (!results.length) {
    return null;
  }

  return results;
}

async function GetThemes() {
  let results = {};

  const re = await req(BASE_URL + URL_THEME);
  const ct = await re.text();
  const $ = cheerio.load(ct);
  const table = $("table[style]");
  $(table).find("td.colthemes").each((_, el) => {
    const th = $(el).find(".metacat.dfbg a");
    const mt = $(el).find(".catpp");

    if (th.length > 1) {
      th.each((i, v) => {
        const ls = mt.eq(i).find("a");
        if (!results[$(v).text().trim()]) {
          results[$(v).text().trim() || "other"] = [];
        }
        ls.each((_, m) => {
          const id = $(m).attr("href").trim().match(/theme\.php\?cat\=(\d+)/i);
          results[$(v).text().trim() || "other"].push({
            id: id ? id[1] : $(m).attr("href").trim().split("/").at(-1),
            name: $(m).text().trim(),
            link: BASE_URL + "/" + $(m).attr("href").trim().replace(/\.\//, ""),
          })
        })
      })
    } else {
      const ls = mt.find("a");
      if (!results[th.text().trim()]) {
        results[th.text().trim() || "other"] = [];
      }
      ls.each((_, m) => {
        const id = $(m).attr("href").trim().match(/theme\.php\?cat\=(\d+)/i);
        results[th.text().trim() || "other"].push({
          id: id ? id[1] : $(m).attr("href").trim().split("/").at(-1),
          name: $(m).text().trim(),
          link: BASE_URL + "/" + $(m).attr("href").trim().replace(/\.\//, ""),
        })
      })
    }
  })

  return results;
}

async function GetAuthor(limit = 10) {
  let results = {};
  let country = [];

  const re = await req(BASE_URL + URL_AUTHOR);
  const ct = await re.text();
  const $ = cheerio.load(ct);
  $(".tdn div.dfsmall[style]").each((_, el) => {
    $(el).find("a").each((_, a) => {
      country.push([$(a).text().trim(), (BASE_URL + $(a).attr("href").trim()).replace("./", "/")]);
    })
  })

  if (limit > country.length) {
    return "Limit melebihi total negara!"
  }

  const task = (link) => {
    const results = [];
    return new Promise(async resolve => {

      const re = await req(link);
      const ct = await re.text();
      const $ = cheerio.load(ct);

      $("div[style=\"float:left\"] div[style=\";padding-right:30px\"] a").each((_, el) => {
        const nl = $(el).text().trim();
        results.push(nl);
      })

      resolve(results);
    })
  }

  const rs = await taskQueue(task, country.slice(0, limit), MAX_WORKERS);

  rs.forEach((v, i) => {
    results[country[i][0].replace(/(\w+)\s?\(\w+\)/i, (_, p1) => p1)] = v;
  })

  return results;
}

async function GetTop(limit = 10) {
  let results = [];
  let page = 1;

  while (results.length < limit) {
    const pageParams = new URLSearchParams({
      page: page
    });
    const gs = await GetRecently(BASE_URL + URL_TOP + "?" + pageParams.toString());
    if (gs == null) {
      break;
    }
    results.push(...gs)
    page++;
  }

  return results;
}

async function GetNew(limit = 10) {
  let results = [];
  let page = 1;

  while (results.length < limit) {
    const pageParams = new URLSearchParams({
      page: page
    });
    const gs = await GetRecently(BASE_URL + URL_NEW + "?" + pageParams.toString());
    if (gs == null) {
      break;
    }
    results.push(...gs)
    page++;
  }

  return results;
}

async function Search(query, limit = 10) {
  let results = [];
  let page = 1;

  while (results.length < limit) {
    const pageParams = new URLSearchParams({
      q: query,
      page: page
    });
    const gs = await GetRecently(BASE_URL + URL_SEARCH + "?" + pageParams.toString(), 0);
    if (gs == null) {
      break;
    }
    results.push(...gs)
    page++;
  }

  return results;
}

async function SearchCategory(catId, limit = 10) {
  let results = [];
  let page = 1;

  while (results.length < limit) {
    const pageParams = new URLSearchParams({
      ...(Number(catId) ? {cat: catId} : {}),
      page: page
    });
    const gs = await GetRecently(Number(catId) ? (BASE_URL + URL_THEME_SEARCH + "?" + pageParams.toString()) : (BASE_URL + "/" + catId + "?" + pageParams.toString()));
    if (gs == null) {
      break;
    }
    results.push(...gs)
    page++;
  }

  return results;
}

/**
 * Contoh penggunaan
 */
(async () => {
  const fs = require("node:fs");
  const LIMIT = 200;

  const recently = await GetRecently();
  await fs.writeFileSync("recently.json", JSON.stringify(recently, null, 2))
  console.log(recently);
  
  const theme = await GetThemes();
  await fs.writeFileSync("theme.json", JSON.stringify(theme, null, 2))
  console.log(theme);
  
  const author = await GetAuthor(20); // 20 negara
  await fs.writeFileSync("author.json", JSON.stringify(author, null, 2))
  console.log(author);
  
  const top = await GetTop(LIMIT);
  await fs.writeFileSync("top.json", JSON.stringify(top, null, 2))
  console.log(top);
  
  const news = await GetNew(LIMIT);
  await fs.writeFileSync("news.json", JSON.stringify(news, null, 2))
  console.log(news);
  
  const search = await Search("Sans serif", LIMIT);
  await fs.writeFileSync("search.json", JSON.stringify(search, null, 2))
  console.log(search);

  /**
   * ID kategory ambil dari getThemes();
   */
  
  const categ = await SearchCategory("303", LIMIT); // Sci-fi ( 303 )
  await fs.writeFileSync("categ.json", JSON.stringify(categ, null, 2))
  console.log(categ);
})();

export { GetRecently, GetAuthor, GetThemes, GetTop, GetNew, Search, SearchCategory };