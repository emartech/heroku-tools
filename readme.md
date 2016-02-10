# Heroku tools

## Batch update certificates
Change certificate on multiple Heroku application. If you choose the "staging" application type then only those applications will be updated which have `-stage` or `-staging` postfix.

```
Usage: node batch-update-certs [options]

Options:
  --heroku_api_key, -k     Heroku api key                    [string] [required]
  --certificate_chain, -c  Public certificate chain file path, usually a .crt or
                           .pem file                         [string] [required]
  --private_key, -p        Private key file path, usually a .key file
                                                             [string] [required]
  --app_type, -t           Application types to change the certificate
                      [choices: "all", "staging", "production"] [default: "all"]
  -h, --help               Show help                                   [boolean]
```
