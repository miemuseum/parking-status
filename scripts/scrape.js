import * as cheerio from "cheerio";
import fs from "fs";

// 日本時間で「今日」を計算
const now = new Date(
  new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
);
const year = now.getFullYear();
const month = now.getMonth() + 1;
const day = now.getDate();

const url = `https://www.center-mie.or.jp/guide/parking/month/${year}/${String(month).padStart(2, "0")}`;

const res = await fetch(url);
const html = await res.text();
const $ = cheerio.load(html);

// 「01日水曜日」のように日付が入っている行を探す
const dayLabel = `${String(day).padStart(2, "0")}日`;
let am = "", pm = "", night = "";

$("table tr").each((_, row) => {
  const text = $(row).text();
  if (text.includes(dayLabel)) {
    const cells = $(row).find("td, th").map((_, el) => $(el).text().trim()).get();
    cells.forEach((c) => {
      if (c.includes("午前")) am = c.replace("午前：", "").trim();
      if (c.includes("午後")) pm = c.replace("午後：", "").trim();
      if (c.includes("夜間")) night = c.replace("夜間：", "").trim();
    });
  }
});

const result = {
  date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  am,
  pm,
  night,
  updatedAt: new Date().toISOString(),
};

fs.writeFileSync("docs/today.json", JSON.stringify(result, null, 2));
console.log(result);
