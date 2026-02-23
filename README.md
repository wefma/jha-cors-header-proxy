日本ハイスコア協会のJSONを返すエンドポイントにCORSを付与するだけのCloudflareWorker
```
$ curl \
  -H "Origin: https://jha-summary.wefma.net" \
  https://jha-summary-api-corsproxy.wefma.net/jha-scores.json
```
