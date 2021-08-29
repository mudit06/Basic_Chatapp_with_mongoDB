const mongo=  require('mongodb').MongoClient

const io = require('socket.io')(3090,{
    cors:{
        origin:'*',
    }
}).sockets


//mongo connection
mongo.connect('mongodb://127.0.0.1/mongoChat', (err,db)=>{
    if(err){
        throw err;
    }
    console.log('Database Connected')

    //socket.io connection
    io.on('connection', socket =>{
        let chat = db.collection('chats')

        //fun to send status
        sendStatus = function(s){
            socket.emit('status', s);
        }

        //get chat from mongoDB
        chat.find().limit(70).sort({_id:1}).toArray((err,res)=>{
            if(err){
                throw err
            }
            //emit the messages
            socket.emit('output',res)//o/p

        })

        //handleing input event
        socket.on('input', data =>{
            let name= data.name
            let message= data.message

            if(name== ""|| message== ""){
                sendStatus('PLease enter name and message')
            }else{
                //insert msg
                chat.insert({name:name,message:message},()=>{
                    io.emit('output',[data])

                    //send status
                    sendStatus({
                        message: 'Message sent',
                        clear: true
                    });
                    
                })

            }
        })

        //handle clear

        socket.on('clear', data =>{
            //remove all chat from collection
            chat.remove({},()=>[
                socket.emit('cleared')
            ])
        })

    })
})