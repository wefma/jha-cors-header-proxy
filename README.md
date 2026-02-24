`https://jha-summary.wefma.net`上に存在する
日本ハイスコア協会のJSONを返すエンドポイントにCORSを付与するだけのCloudflareWorker
```
$ curl \
  -H "Origin: https://jha-summary.wefma.net" \
  https://jha-summary-api-cors.wefma.net/jha-scores.json
```
