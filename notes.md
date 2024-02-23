```
worker_connections 20
db pool: 10

api:
cpu: 0.3
mem: 150MB

nginx:
cpu: 0.1
mem: 10MB

postgres:
cpu: 0.8
mem: 240MB

performance:
- broke at 20s
- few KOs when started
```

```
worker_connections 50
db pool: 10

api:
cpu: 0.3
mem: 150MB

nginx:
cpu: 0.1
mem: 10MB

postgres:
cpu: 0.8
mem: 240MB

performance:
- broke at 25s
- 5 KOs when started
```

```
worker_connections 100
db pool: 10

api:
cpu: 0.3
mem: 150MB

nginx:
cpu: 0.1
mem: 10MB

postgres:
cpu: 0.8
mem: 240MB

performance:
- broke at 20s
- no KOs when started
```

```
worker_connections 200
db pool: 10

api:
cpu: 0.3
mem: 150MB

nginx:
cpu: 0.1
mem: 10MB

postgres:
cpu: 0.8
mem: 240MB

performance:
- broke at 20s
- no KOs when started
```

```
worker_connections 100
db pool: 10

api:
cpu: 0.3
mem: 150MB

nginx:
cpu: 0.1
mem: 10MB

postgres:
cpu: 3
mem: 500MB

performance:
- broke at 20s
- no KOs when started
```

```
worker_connections 100
db pool: 10

api:
cpu: 1
mem: 250MB

nginx:
cpu: 0.1
mem: 10MB

postgres:
cpu: 3
mem: 500MB

performance:
- broke at 20s
- no KOs when started
```

```
worker_connections 1000
db pool: 10

api:
cpu: 1
mem: 250MB

nginx:
cpu: 1
mem: 10MB

postgres:
cpu: 3
mem: 500MB

performance:
- broke at 30s
- no KOs when started
```
