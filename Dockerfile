FROM golang:1.19.2-bullseye

WORKDIR /app

# Simply copy everything over for now
COPY ./db ./db
COPY ./fib ./fib
COPY ./go.mod ./go.mod
COPY ./go.sum ./go.sum
COPY ./server.go ./server.go

RUN go mod download

RUN go build server.go

EXPOSE 8080

CMD [ "./server" ]
