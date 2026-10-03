globalThis.__nitro_main__ = import.meta.url;
import "./_libs/unenv.mjs";

import { H as HookableCore } from "./_libs/hookable.mjs";
import { d as defineLazyEventHandler, H as HTTPError, a as H3Core } from "./_libs/h3.mjs";
import { a as FastResponse } from "./_libs/srvx.mjs";


import "./_libs/react.mjs";
import "./_libs/rou3.mjs";





function lazyService(loader) {
  let promise, mod;
  return {
    fetch(req) {
      if (mod) {
        return mod.fetch(req);
      }
      if (!promise) {
        promise = loader().then((_mod) => mod = _mod.default || _mod);
      }
      return promise.then((mod2) => mod2.fetch(req));
    }
  };
}
const services = {
  ["ssr"]: lazyService(() => import("./_ssr/index.mjs"))
};
globalThis.__nitro_vite_envs__ = services;
const assets = {
  "/assets/AppShell-BNFTKDuu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f96-iRaqIPv4EHFkVw3TShVLLc3/1k4"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 3990,
    "path": "../public/assets/AppShell-BNFTKDuu.js"
  },
  "/assets/ChatDrawer-Dst-OPUU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"24ba-gHIqAQvdg1WwIQ5mvK+vr+kOk0E"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 9402,
    "path": "../public/assets/ChatDrawer-Dst-OPUU.js"
  },
  "/assets/NeonButton-U4rKu26I.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"37c-9i3EUUosRPjOPUn02eSPBqLztro"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 892,
    "path": "../public/assets/NeonButton-U4rKu26I.js"
  },
  "/assets/anton-latin-400-normal-Byf51wtH.woff2": {
    "type": "font/woff2",
    "etag": '"48b4-ub7qCARanLrcgZc0/0AqvowIG/s"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 18612,
    "path": "../public/assets/anton-latin-400-normal-Byf51wtH.woff2"
  },
  "/assets/anton-latin-400-normal-AUNGEG_V.woff": {
    "type": "font/woff",
    "etag": '"3d10-LN2tA1lgFtVFOapFdrlxbabd7JQ"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 15632,
    "path": "../public/assets/anton-latin-400-normal-AUNGEG_V.woff"
  },
  "/assets/anton-latin-ext-400-normal-BMODBQc6.woff": {
    "type": "font/woff",
    "etag": '"6da8-rl9dHVaC3kbqfYsjwt2DXfgP6Lw"',
    "mtime": "2026-10-03T10:05:12.138Z",
    "size": 28072,
    "path": "../public/assets/anton-latin-ext-400-normal-BMODBQc6.woff"
  },
  "/assets/anton-latin-ext-400-normal-SyiqE2Jt.woff2": {
    "type": "font/woff2",
    "etag": '"7a7c-OtpBAcPtCCD/SAjJJHqyky6QdKw"',
    "mtime": "2026-10-03T10:05:12.138Z",
    "size": 31356,
    "path": "../public/assets/anton-latin-ext-400-normal-SyiqE2Jt.woff2"
  },
  "/assets/create-room-BKOCwV_k.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"fb2-T4EVcFfMNRzyHzlMg4i+JR4Ucm4"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 4018,
    "path": "../public/assets/create-room-BKOCwV_k.js"
  },
  "/assets/anton-vietnamese-400-normal-CkBxLiRJ.woff2": {
    "type": "font/woff2",
    "etag": '"21e8-4rtu0QE4Q2m8i7+jVSDJbXOLHok"',
    "mtime": "2026-10-03T10:05:12.138Z",
    "size": 8680,
    "path": "../public/assets/anton-vietnamese-400-normal-CkBxLiRJ.woff2"
  },
  "/assets/games-Dza-1YfT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"166-ZH5aKUT+1k11gqtGChO85OOgVx0"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 358,
    "path": "../public/assets/games-Dza-1YfT.js"
  },
  "/assets/anton-vietnamese-400-normal-2FfR1wHA.woff": {
    "type": "font/woff",
    "etag": '"1aa4-Pr3g9RuYUqJCpwyZd9Ahk0Eksbg"',
    "mtime": "2026-10-03T10:05:12.138Z",
    "size": 6820,
    "path": "../public/assets/anton-vietnamese-400-normal-2FfR1wHA.woff"
  },
  "/assets/index-BNU8G7sa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"140a-84HwFPuRCtA0wk37XqtQkU5xXfc"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 5130,
    "path": "../public/assets/index-BNU8G7sa.js"
  },
  "/assets/index-nuRx6Qlr.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"6d50-wNTD2zbwS5VsHOyDqhciKCIxYDQ"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 27984,
    "path": "../public/assets/index-nuRx6Qlr.css"
  },
  "/assets/inter-cyrillic-400-normal-HOLc17fK.woff": {
    "type": "font/woff",
    "etag": '"2634-ivoNz55T3CYjsRGYVvI78V6Hg84"',
    "mtime": "2026-10-03T10:05:12.138Z",
    "size": 9780,
    "path": "../public/assets/inter-cyrillic-400-normal-HOLc17fK.woff"
  },
  "/assets/inter-cyrillic-700-normal-CjBOestx.woff2": {
    "type": "font/woff2",
    "etag": '"1ee0-D8f9uATzhIzndMrJ0Y11iQjPdds"',
    "mtime": "2026-10-03T10:05:12.138Z",
    "size": 7904,
    "path": "../public/assets/inter-cyrillic-700-normal-CjBOestx.woff2"
  },
  "/assets/inter-cyrillic-400-normal-obahsSVq.woff2": {
    "type": "font/woff2",
    "etag": '"1e20-2UATdNvSyhAwBTFW7JWXRnJeZyk"',
    "mtime": "2026-10-03T10:05:12.138Z",
    "size": 7712,
    "path": "../public/assets/inter-cyrillic-400-normal-obahsSVq.woff2"
  },
  "/assets/inter-cyrillic-700-normal-DrXBdSj3.woff": {
    "type": "font/woff",
    "etag": '"26b8-AaxySEnVJ+M+6514gHrK4csJma0"',
    "mtime": "2026-10-03T10:05:12.138Z",
    "size": 9912,
    "path": "../public/assets/inter-cyrillic-700-normal-DrXBdSj3.woff"
  },
  "/assets/inter-cyrillic-ext-400-normal-BQZuk6qB.woff2": {
    "type": "font/woff2",
    "etag": '"27f8-vx2gCiZcZIS7BSyHWqEe1Lm5p8Y"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 10232,
    "path": "../public/assets/inter-cyrillic-ext-400-normal-BQZuk6qB.woff2"
  },
  "/assets/inter-cyrillic-ext-400-normal-DQukG94-.woff": {
    "type": "font/woff",
    "etag": '"3418-0efK3fiFhInlHHjq0SFm+GVey2Y"',
    "mtime": "2026-10-03T10:05:12.138Z",
    "size": 13336,
    "path": "../public/assets/inter-cyrillic-ext-400-normal-DQukG94-.woff"
  },
  "/assets/inter-cyrillic-ext-700-normal-BjwYoWNd.woff2": {
    "type": "font/woff2",
    "etag": '"2900-0N8FIokKpqZhWi+D5DLndc4iUGY"',
    "mtime": "2026-10-03T10:05:12.138Z",
    "size": 10496,
    "path": "../public/assets/inter-cyrillic-ext-700-normal-BjwYoWNd.woff2"
  },
  "/assets/inter-cyrillic-ext-700-normal-LO58E6JB.woff": {
    "type": "font/woff",
    "etag": '"3460-O0B5vyXV2ljXcmbQhvmTQJXWVuc"',
    "mtime": "2026-10-03T10:05:12.138Z",
    "size": 13408,
    "path": "../public/assets/inter-cyrillic-ext-700-normal-LO58E6JB.woff"
  },
  "/assets/inter-greek-400-normal-B4URO6DV.woff2": {
    "type": "font/woff2",
    "etag": '"1e60-ha06h5lB7nxuWvNKf61Dcnc1d1I"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 7776,
    "path": "../public/assets/inter-greek-400-normal-B4URO6DV.woff2"
  },
  "/assets/inter-greek-400-normal-q2sYcFCs.woff": {
    "type": "font/woff",
    "etag": '"26c4-bdX1N3nNMZxQdZJFiVUIvfgvPUk"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 9924,
    "path": "../public/assets/inter-greek-400-normal-q2sYcFCs.woff"
  },
  "/assets/inter-greek-700-normal-BUv2fZ6O.woff": {
    "type": "font/woff",
    "etag": '"26fc-6VHcgzrZm5Dq3Ofg/SG0LimdBHI"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 9980,
    "path": "../public/assets/inter-greek-700-normal-BUv2fZ6O.woff"
  },
  "/assets/index-rSX5mxiS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"84222-1SYRjmO4AfvdAc3JcoSH6711dkY"',
    "mtime": "2026-10-03T10:05:12.146Z",
    "size": 541218,
    "path": "../public/assets/index-rSX5mxiS.js"
  },
  "/assets/inter-greek-ext-400-normal-DGGRlc-M.woff2": {
    "type": "font/woff2",
    "etag": '"1490-FueWPOzdNQpScjKjfRcVv5Yv1HM"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 5264,
    "path": "../public/assets/inter-greek-ext-400-normal-DGGRlc-M.woff2"
  },
  "/assets/inter-greek-700-normal-C3JjAnD8.woff2": {
    "type": "font/woff2",
    "etag": '"1ef0-LHrivJw+k04PRvScx047LwlyCQM"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 7920,
    "path": "../public/assets/inter-greek-700-normal-C3JjAnD8.woff2"
  },
  "/assets/inter-greek-ext-400-normal-KugGGMne.woff": {
    "type": "font/woff",
    "etag": '"1b98-M0BooO/fFnrQlgRJzUMnDMWQ/Qo"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 7064,
    "path": "../public/assets/inter-greek-ext-400-normal-KugGGMne.woff"
  },
  "/assets/inter-greek-ext-700-normal-BoQ6DsYi.woff": {
    "type": "font/woff",
    "etag": '"1c30-9rBd06jWL1DufBIVe/ZeKo67yXU"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 7216,
    "path": "../public/assets/inter-greek-ext-700-normal-BoQ6DsYi.woff"
  },
  "/assets/inter-greek-ext-700-normal-qfdV9bQt.woff2": {
    "type": "font/woff2",
    "etag": '"1544-Po0VSwP0X4mCd4Bi+vzYGFAlRtE"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 5444,
    "path": "../public/assets/inter-greek-ext-700-normal-qfdV9bQt.woff2"
  },
  "/assets/inter-latin-400-normal-C38fXH4l.woff2": {
    "type": "font/woff2",
    "etag": '"5c70-aPZFxrb/EuJcVLE9TtEZ5jHcuyY"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 23664,
    "path": "../public/assets/inter-latin-400-normal-C38fXH4l.woff2"
  },
  "/assets/inter-latin-400-normal-CyCys3Eg.woff": {
    "type": "font/woff",
    "etag": '"77e8-SbvLwKxssThdk7eEO6Aafq1EDIA"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 30696,
    "path": "../public/assets/inter-latin-400-normal-CyCys3Eg.woff"
  },
  "/assets/inter-latin-700-normal-BLAVimhd.woff": {
    "type": "font/woff",
    "etag": '"7a58-cQvU1F9kXU/ZpvVIy7T98mV4J+E"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 31320,
    "path": "../public/assets/inter-latin-700-normal-BLAVimhd.woff"
  },
  "/assets/inter-latin-ext-400-normal-77YHD8bZ.woff": {
    "type": "font/woff",
    "etag": '"b9c8-Bhja6T6VCwLwb1wadgBSy3MfJBM"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 47560,
    "path": "../public/assets/inter-latin-ext-400-normal-77YHD8bZ.woff"
  },
  "/assets/inter-latin-700-normal-Yt3aPRUw.woff2": {
    "type": "font/woff2",
    "etag": '"5f24-UZenrrIkVBEKofPvPtTJjKfvG6E"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 24356,
    "path": "../public/assets/inter-latin-700-normal-Yt3aPRUw.woff2"
  },
  "/assets/inter-latin-ext-400-normal-C1nco2VV.woff2": {
    "type": "font/woff2",
    "etag": '"88b8-G/H4NxekwCldh2+r75P8W7SzF98"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 35e3,
    "path": "../public/assets/inter-latin-ext-400-normal-C1nco2VV.woff2"
  },
  "/assets/inter-latin-ext-700-normal-Ca8adRJv.woff2": {
    "type": "font/woff2",
    "etag": '"8d94-yNVVBni5SnCMi1iBd7oIoQ4VttA"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 36244,
    "path": "../public/assets/inter-latin-ext-700-normal-Ca8adRJv.woff2"
  },
  "/assets/inter-latin-ext-700-normal-TidjK2hL.woff": {
    "type": "font/woff",
    "etag": '"bdf8-cQlr/tU/y6KwF0S0VxtHZkfIWHg"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 48632,
    "path": "../public/assets/inter-latin-ext-700-normal-TidjK2hL.woff"
  },
  "/assets/inter-vietnamese-400-normal-Bbgyi5SW.woff": {
    "type": "font/woff",
    "etag": '"1964-Uz2qf+4P37GRYrj2tnfiNdz3cwc"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 6500,
    "path": "../public/assets/inter-vietnamese-400-normal-Bbgyi5SW.woff"
  },
  "/assets/inter-vietnamese-700-normal-BZaoP0fm.woff": {
    "type": "font/woff",
    "etag": '"19e8-bdSpfj6ZS6+Lvz7ijFjLexeYSQ4"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 6632,
    "path": "../public/assets/inter-vietnamese-700-normal-BZaoP0fm.woff"
  },
  "/assets/inter-vietnamese-400-normal-DMkecbls.woff2": {
    "type": "font/woff2",
    "etag": '"136c-x5LSIOvtcMpNpAaXtHsgRr9Y068"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 4972,
    "path": "../public/assets/inter-vietnamese-400-normal-DMkecbls.woff2"
  },
  "/assets/inter-vietnamese-700-normal-DlLaEgI2.woff2": {
    "type": "font/woff2",
    "etag": '"13f0-2+yadyA0heA/Lel/M8LdWlzEV1U"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 5104,
    "path": "../public/assets/inter-vietnamese-700-normal-DlLaEgI2.woff2"
  },
  "/assets/jetbrains-mono-cyrillic-400-normal-BEIGL1Tu.woff2": {
    "type": "font/woff2",
    "etag": '"14d0-wP6+M+HGdr9/ksFVSvTe+I0Y0rI"',
    "mtime": "2026-10-03T10:05:12.138Z",
    "size": 5328,
    "path": "../public/assets/jetbrains-mono-cyrillic-400-normal-BEIGL1Tu.woff2"
  },
  "/assets/jetbrains-mono-cyrillic-400-normal-ugxPyKxw.woff": {
    "type": "font/woff",
    "etag": '"1b40-oGh4jaPe06qJnXZqmnfGfJQP4Ag"',
    "mtime": "2026-10-03T10:05:12.138Z",
    "size": 6976,
    "path": "../public/assets/jetbrains-mono-cyrillic-400-normal-ugxPyKxw.woff"
  },
  "/assets/jetbrains-mono-cyrillic-700-normal-BWTpRfYl.woff2": {
    "type": "font/woff2",
    "etag": '"14d8-uEsdZneisVjPuS7ZEwojkHNoYno"',
    "mtime": "2026-10-03T10:05:12.138Z",
    "size": 5336,
    "path": "../public/assets/jetbrains-mono-cyrillic-700-normal-BWTpRfYl.woff2"
  },
  "/assets/jetbrains-mono-cyrillic-700-normal-CEoEElIJ.woff": {
    "type": "font/woff",
    "etag": '"1b68-601iS1WuHh592Wdo08Z2ylQVehQ"',
    "mtime": "2026-10-03T10:05:12.138Z",
    "size": 7016,
    "path": "../public/assets/jetbrains-mono-cyrillic-700-normal-CEoEElIJ.woff"
  },
  "/assets/jetbrains-mono-greek-400-normal-B9oWc5Lo.woff": {
    "type": "font/woff",
    "etag": '"1620-uF5DPKyxthnzZIfm2hBQUEmcCDI"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 5664,
    "path": "../public/assets/jetbrains-mono-greek-400-normal-B9oWc5Lo.woff"
  },
  "/assets/jetbrains-mono-greek-400-normal-C190GLew.woff2": {
    "type": "font/woff2",
    "etag": '"1084-bKcqPuNhRWWCQbsWLqSOoRkxv70"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 4228,
    "path": "../public/assets/jetbrains-mono-greek-400-normal-C190GLew.woff2"
  },
  "/assets/jetbrains-mono-greek-700-normal-C6CZE3T8.woff2": {
    "type": "font/woff2",
    "etag": '"10cc-iU6mLpI+tWMlC1FcVSvQ32zZ8B4"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 4300,
    "path": "../public/assets/jetbrains-mono-greek-700-normal-C6CZE3T8.woff2"
  },
  "/assets/jetbrains-mono-greek-700-normal-DEigVDxa.woff": {
    "type": "font/woff",
    "etag": '"1640-24aBjRrW14SiFiapfKn+hPhSAng"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 5696,
    "path": "../public/assets/jetbrains-mono-greek-700-normal-DEigVDxa.woff"
  },
  "/assets/jetbrains-mono-latin-400-normal-6-qcROiO.woff": {
    "type": "font/woff",
    "etag": '"6b68-PjVYVbMXaGEDnHrQQmycVNcGrEA"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 27496,
    "path": "../public/assets/jetbrains-mono-latin-400-normal-6-qcROiO.woff"
  },
  "/assets/jetbrains-mono-latin-400-normal-V6pRDFza.woff2": {
    "type": "font/woff2",
    "etag": '"52b0-OuYhUYIQ5ljyzsko4MOu3m0M7+I"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 21168,
    "path": "../public/assets/jetbrains-mono-latin-400-normal-V6pRDFza.woff2"
  },
  "/assets/jetbrains-mono-latin-700-normal-D3wTyLJW.woff": {
    "type": "font/woff",
    "etag": '"6e30-TDbmV9Ea5nDUwtGLlVZgBe4hKEY"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 28208,
    "path": "../public/assets/jetbrains-mono-latin-700-normal-D3wTyLJW.woff"
  },
  "/assets/jetbrains-mono-latin-700-normal-BYuf6tUa.woff2": {
    "type": "font/woff2",
    "etag": '"5594-5n+P79LwTQ/OmWmR/2dryd0I4NA"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 21908,
    "path": "../public/assets/jetbrains-mono-latin-700-normal-BYuf6tUa.woff2"
  },
  "/assets/jetbrains-mono-latin-ext-400-normal-Bc8Ftmh3.woff2": {
    "type": "font/woff2",
    "etag": '"1ca8-sBWBn421OuV4ZHOZxHJjafE1huU"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 7336,
    "path": "../public/assets/jetbrains-mono-latin-ext-400-normal-Bc8Ftmh3.woff2"
  },
  "/assets/jetbrains-mono-latin-ext-700-normal-CZipNAKV.woff2": {
    "type": "font/woff2",
    "etag": '"1d30-53PvlW66//txAPx2PwO9uqg9U9w"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 7472,
    "path": "../public/assets/jetbrains-mono-latin-ext-700-normal-CZipNAKV.woff2"
  },
  "/assets/jetbrains-mono-latin-ext-400-normal-fXTG6kC5.woff": {
    "type": "font/woff",
    "etag": '"2790-MZORDuKd3VMoaYVXmW8yROWL9sY"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 10128,
    "path": "../public/assets/jetbrains-mono-latin-ext-400-normal-fXTG6kC5.woff"
  },
  "/assets/jetbrains-mono-latin-ext-700-normal-CxPITLHs.woff": {
    "type": "font/woff",
    "etag": '"2840-TcG00VbnyrWbdLitW+Hml9WOj4I"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 10304,
    "path": "../public/assets/jetbrains-mono-latin-ext-700-normal-CxPITLHs.woff"
  },
  "/assets/jetbrains-mono-vietnamese-700-normal-BDLVIk2r.woff": {
    "type": "font/woff",
    "etag": '"154c-JA98A4ezQ1urmwT7z+6wu1T6FtM"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 5452,
    "path": "../public/assets/jetbrains-mono-vietnamese-700-normal-BDLVIk2r.woff"
  },
  "/assets/jetbrains-mono-vietnamese-400-normal-CqNFfHCs.woff": {
    "type": "font/woff",
    "etag": '"14fc-wa8Pi/SxAFg9ve8x5GbO/sMJWEo"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 5372,
    "path": "../public/assets/jetbrains-mono-vietnamese-400-normal-CqNFfHCs.woff"
  },
  "/assets/join-room-ChuEjc_y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8ed-LLAQlfZw50Ei7XZ4KFqQvOIwYNY"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 2285,
    "path": "../public/assets/join-room-ChuEjc_y.js"
  },
  "/assets/lobby._roomId-Ddh7Pls2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"22d0-3uNk6IaRpiBD5d0bSMcACb6u1Fs"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 8912,
    "path": "../public/assets/lobby._roomId-Ddh7Pls2.js"
  },
  "/assets/lobbyStore-4iTB9_63.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4e1-zLJr1mSPaaXNeJ6RYTrqFc5WS0k"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 1249,
    "path": "../public/assets/lobbyStore-4iTB9_63.js"
  },
  "/assets/lock-DrqQKjx1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"cf-KJiBNv+GccLjFPWgMP9Fjd6fdew"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 207,
    "path": "../public/assets/lock-DrqQKjx1.js"
  },
  "/assets/login-NMi-xy80.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8ce-rb6GZysl9rwCupo0JhiWlJn2G6s"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 2254,
    "path": "../public/assets/login-NMi-xy80.js"
  },
  "/assets/mafia-art-CkKHvIeD.jpg": {
    "type": "image/jpeg",
    "etag": '"e18f-pK5ME2b4d0wkJfOmZcm6JFJTkZ8"',
    "mtime": "2026-10-03T10:05:12.134Z",
    "size": 57743,
    "path": "../public/assets/mafia-art-CkKHvIeD.jpg"
  },
  "/assets/mafia._gameId-2W_yS0lz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2f81-rhiY9LujW4NEIoosi9mrO6Jl7NI"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 12161,
    "path": "../public/assets/mafia._gameId-2W_yS0lz.js"
  },
  "/assets/mafiaEngine-Dnj92CLt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1092-SVBtZ+jvSNY66ezUU3Gi1TiHhH8"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 4242,
    "path": "../public/assets/mafiaEngine-Dnj92CLt.js"
  },
  "/assets/profile-CIdAJdFT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"759-2JpkN1nv0mRJTwWjtSK1IUikOQ4"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 1881,
    "path": "../public/assets/profile-CIdAJdFT.js"
  },
  "/assets/monopoly._gameId-DsRuh1-X.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"12fab-CAM08KXFK2q1EywABcmwgD3Nqb8"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 77739,
    "path": "../public/assets/monopoly._gameId-DsRuh1-X.js"
  },
  "/assets/register-DIgwAXgO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"71c-nBQZt66BgT6ZVgPI/qpK52x8LgY"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 1820,
    "path": "../public/assets/register-DIgwAXgO.js"
  },
  "/assets/monopoly-art-TmOOsyH4.jpg": {
    "type": "image/jpeg",
    "etag": '"24078-8ZhQZRKkf9ykwfbriBpILLKckHU"',
    "mtime": "2026-10-03T10:05:12.138Z",
    "size": 147576,
    "path": "../public/assets/monopoly-art-TmOOsyH4.jpg"
  },
  "/assets/proxy-LhDHOKvH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1df00-FKlhPpGaMhaEZ2/H9q4IBg9YaQQ"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 122624,
    "path": "../public/assets/proxy-LhDHOKvH.js"
  },
  "/assets/settings-064epl-H.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5c6-BYIKp7FONnm80Uem1TYGYisf0/g"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 1478,
    "path": "../public/assets/settings-064epl-H.js"
  },
  "/assets/styles-DipbZta0.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"19dc0-N8cOs9O53jtTZUwLQHmNbt4nKH0"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 105920,
    "path": "../public/assets/styles-DipbZta0.css"
  },
  "/assets/trophy-BKEhSESG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2e9-I1hmEwyQuWfQ5nJqCrRslcNYdSE"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 745,
    "path": "../public/assets/trophy-BKEhSESG.js"
  },
  "/assets/useRooms-_IaVzPiK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3438-wWBA0a+/2uvx80cLdEBn5zaWQZo"',
    "mtime": "2026-10-03T10:05:12.142Z",
    "size": 13368,
    "path": "../public/assets/useRooms-_IaVzPiK.js"
  }
};
const publicAssetBases = {};
function isPublicAssetURL(id = "") {
  if (assets[id]) {
    return true;
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) {
      return true;
    }
  }
  return false;
}
const headers = ((m) => function headersRouteRule(event) {
  for (const [key, value] of Object.entries(m.options || {})) {
    event.res.headers.set(key, value);
  }
});
const findRouteRules = /* @__PURE__ */ (() => {
  const $0 = [{ name: "headers", route: "/assets/**", handler: headers, options: { "cache-control": "public, max-age=31536000, immutable" } }];
  return (m, p) => {
    let r = [];
    if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
    let s = p.split("/"), l = s.length;
    if (l > 1) {
      if (s[1] === "assets") {
        r.unshift({ data: $0, params: { "_": s.slice(2).join("/") } });
      }
    }
    return r;
  };
})();
const _lazy_29x3av = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
const findRoute = /* @__PURE__ */ (() => {
  const data = { route: "/**", handler: _lazy_29x3av };
  return ((_m, p) => {
    return { data, params: { "_": p.slice(1) } };
  });
})();
const errorHandler$1 = (error, event) => {
  const res = defaultHandler(error, event);
  return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
  const unhandled = error.unhandled ?? !HTTPError.isError(error);
  const { status = 500, statusText = "" } = unhandled ? {} : error;
  if (status === 404) {
    const url = event.url || new URL(event.req.url);
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      return {
        status: 302,
        headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
      };
    }
  }
  const headers2 = new Headers(unhandled ? {} : error.headers);
  headers2.set("content-type", "application/json; charset=utf-8");
  const jsonBody = unhandled ? {
    status,
    unhandled: true
  } : typeof error.toJSON === "function" ? error.toJSON() : {
    status,
    statusText,
    message: error.message
  };
  return {
    status,
    statusText,
    headers: headers2,
    body: {
      error: true,
      ...jsonBody
    }
  };
}
const errorHandlers = [errorHandler$1];
async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      const response = await handler(error, event, { defaultHandler });
      if (response) {
        return response;
      }
    } catch (error2) {
      console.error(error2);
    }
  }
}
function createNitroApp() {
  const captureError = (error, errorCtx) => {
    if (errorCtx?.event) {
      const errors = errorCtx.event.req.context?.nitro?.errors;
      if (errors) {
        errors.push({ error, context: errorCtx });
      }
    }
  };
  const h3App = createH3App({
    onError(error, event) {
      return errorHandler(error, event);
    }
  });
  let appHandler = (req) => {
    req.context ||= {};
    req.context.nitro = req.context.nitro || { errors: [] };
    return h3App.fetch(req);
  };
  return {
    fetch: appHandler,
    h3: h3App,
    hooks: void 0,
    captureError
  };
}
function createH3App(config) {
  const h3App = new H3Core(config);
  h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
  h3App["~getMiddleware"] = (event, route) => {
    const pathname = event.url.pathname;
    const method = event.req.method;
    const middleware = [];
    const routeRules = getRouteRules(method, pathname);
    event.context.routeRules = routeRules?.routeRules;
    if (routeRules?.routeRuleMiddleware.length) {
      middleware.push(...routeRules.routeRuleMiddleware);
    }
    if (route?.data?.middleware?.length) {
      middleware.push(...route.data.middleware);
    }
    return middleware;
  };
  return h3App;
}
const APP_ID = "default";
function useNitroApp() {
  let instance = useNitroApp._instance;
  if (instance) {
    return instance;
  }
  instance = useNitroApp._instance = createNitroApp();
  globalThis.__nitro__ = globalThis.__nitro__ || {};
  globalThis.__nitro__[APP_ID] = instance;
  return instance;
}
function useNitroHooks() {
  const nitroApp = useNitroApp();
  const hooks = nitroApp.hooks;
  if (hooks) {
    return hooks;
  }
  return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
  const m = findRouteRules(method, pathname);
  if (!m?.length) {
    return { routeRuleMiddleware: [] };
  }
  const routeRules = {};
  for (const layer of m) {
    for (const rule of layer.data) {
      const currentRule = routeRules[rule.name];
      if (currentRule) {
        if (rule.options === false) {
          delete routeRules[rule.name];
          continue;
        }
        if (typeof currentRule.options === "object" && typeof rule.options === "object") {
          currentRule.options = {
            ...currentRule.options,
            ...rule.options
          };
        } else {
          currentRule.options = rule.options;
        }
        currentRule.route = rule.route;
        currentRule.params = {
          ...currentRule.params,
          ...layer.params
        };
      } else if (rule.options !== false) {
        routeRules[rule.name] = {
          ...rule,
          params: layer.params
        };
      }
    }
  }
  const middleware = [];
  const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
  for (const rule of orderedRules) {
    if (rule.options === false || !rule.handler) {
      continue;
    }
    middleware.push(rule.handler(rule));
  }
  return {
    routeRules,
    routeRuleMiddleware: middleware
  };
}
function createHandler(hooks) {
  const nitroApp = useNitroApp();
  const nitroHooks = useNitroHooks();
  return {
    async fetch(request, env, context) {
      globalThis.__env__ = env;
      augmentReq(request, {
        env,
        context
      });
      const ctxExt = {};
      const url = new URL(request.url);
      if (hooks.fetch) {
        const res = await hooks.fetch(request, env, context, url, ctxExt);
        if (res) {
          return res;
        }
      }
      return await nitroApp.fetch(request);
    },
    scheduled(controller, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
        controller,
        env,
        context
      }) || Promise.resolve());
    },
    email(message, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:email", {
        message,
        event: message,
        env,
        context
      }) || Promise.resolve());
    },
    queue(batch, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
        batch,
        event: batch,
        env,
        context
      }) || Promise.resolve());
    },
    tail(traces, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
        traces,
        env,
        context
      }) || Promise.resolve());
    },
    trace(traces, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
        traces,
        env,
        context
      }) || Promise.resolve());
    }
  };
}
function augmentReq(cfReq, ctx) {
  const req = cfReq;
  req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
  req.runtime ??= { name: "cloudflare" };
  req.runtime.cloudflare = {
    ...req.runtime.cloudflare,
    ...ctx
  };
  req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
const cloudflareModule = createHandler({ fetch(cfRequest, env, context, url) {
  if (env.ASSETS && isPublicAssetURL(url.pathname)) {
    return env.ASSETS.fetch(cfRequest);
  }
} });
export {
  cloudflareModule as default
};
