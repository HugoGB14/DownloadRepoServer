import express from 'express'
import path from 'node:path'
import fs from 'node:fs'
import bodyParser from 'body-parser'

const app = express()
const downloadDir = path.join('.', 'download')
app.use(bodyParser.raw({ type: '*/*' }))
app.set('view engine', 'ejs')

app.get("/", (req, res) => {
    let dirPath;
    if (req.query.path === undefined) {dirPath = downloadDir}
    else {dirPath = path.join(downloadDir, req.query.path)}
    let dirPathB = dirPath.split(path.sep)
    dirPathB.shift()
    dirPathB = dirPathB.join(path.sep)
    fs.readdir(dirPath, {withFileTypes: true}, (err, files) => {
        if (err) {
            return res.status(500).send('Error: ' + err)
        }
        const filesData = files.map(file => ({
            name: file.name,
            path: path.join(dirPathB, file.name),
            isDirectory: file.isDirectory()
        }))

        res.render('index', {files: filesData, currentPath: dirPathB, path: path})
    })
})

app.get('/download', (req, res) => {
    const filePath = path.join(downloadDir, req.query.path)
    fs.readFile(filePath, (err, data) => {
        if (err) {
            return res.status(500).send('Error: ' + err)
        }
        res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`)
        res.status(200).send(data)
    })
})

app.post('/upload', (req, res) => {
    const filePath = path.join(downloadDir, req.query.path)
    const fileBuffer = req.body
    const fileName = req.headers['content-disposition'].split('filename=')[1]
    fs.writeFile(path.join(filePath, fileName), fileBuffer, (err) => {
        if (err) {
            console.error(err)
            return res.status(500).send('Error: ' + err)
        }
        res.status(201).redirect('/?path=' + filePath)
    });
    
})


app.listen(80, () => {
    console.log("Server started in http://localhost/")
})