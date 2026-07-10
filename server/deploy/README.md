# SSH deploy keys

## Public key (добавить на сервер)

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFC8suouaTNKPzQK7M//LYtwYsD6tJqKm4QiDGyiJbqy littledalat-deploy
```

## Как использовать

1. Скопировать приватный ключ в `~/.ssh/littledalat-deploy-key`
2. Скопировать `config` в `~/.ssh/config` (или добавить содержимое)
3. Подключиться:
   ```bash
   ssh littledalat
   ```

Или напрямую:
```bash
ssh -i ~/.ssh/littledalat-deploy-key -p 32000 root@96.9.231.111
```

## Добавление публичного ключа на сервер

```bash
ssh-copy-id -i ~/.ssh/littledalat-deploy-key.pub -p 32000 root@96.9.231.111
```

Или вручную:
```bash
cat ~/.ssh/littledalat-deploy-key.pub | ssh -p 32000 root@96.9.231.111 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```
