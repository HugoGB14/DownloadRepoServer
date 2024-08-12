import express from 'express'
import path from 'node:path'
import fs from 'node:fs'
const app = express()
const downloadDir = path.join('.', 'download')
app.use('/upload', express.raw({ type: '*/*', limit: '250mb' }))
app.use('/mkdir', express.urlencoded({ extended: false }))
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
    fs.writeFile(filePath, fileBuffer, (err) => {
        if (err) {
            console.error(err)
            return res.status(500).send('Error: ' + err)
        }
    });
    
})

app.post('/mkdir',(req, res) => {
    const dirPath = path.join(downloadDir, req.body.curdir, req.body.name)
    fs.mkdir(dirPath, (err) => {
        if (err) {
            console.error(err)
            return res.status(500).send('Error: ' + err)
        }
        res.status(200).redirect('/?path=' + req.body.curdir)
    });
})


app.listen(80, () => {
    console.log("Server started in http://localhost/")
})