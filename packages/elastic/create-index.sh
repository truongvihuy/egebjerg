curl --location --request DELETE 'http://localhost:9200/egebjerg-product'

printf "\n"

curl --location --request PUT 'http://localhost:9200/egebjerg-product?include_type_name=true' \
--header 'Content-Type: application/json' \
--data-raw '{
    "settings": {
        "number_of_shards": 1,
        "number_of_replicas": 0,
        "analysis": {
            "analyzer": {
                "my_analyzer": {
                    "type": "custom",
                    "tokenizer": "icu_tokenizer",
                    "filter": [
                        "icu_folding",
                        "lowercase"
                    ]
                }
            }
        },
        "index": {
            "similarity": {
                "my_similarity": {
                    "type": "BM25",
                    "k1": 1.2,
                    "b": 0
                }
            }
        }
    },
    "mappings": {
        "product" : {
            "properties": {
                "name": {
                    "type": "text",
                    "analyzer": "my_analyzer"
                },
                "name_comp": {
                    "type": "completion",
                    "analyzer": "my_analyzer",
                    "contexts": [
                        {
                          "name": "category_id",
                          "type": "category",
                          "path": "cat"
                        }
                    ]
                }
            }
        }
    }
}'