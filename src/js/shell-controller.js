'use strict';

import {formatNumber} from './utils'

const CONTENT_TYPE = {
    FILE: "file",
    DIR: "dir"
};

export class ShellController {
    constructor(shellView, data) {
        this.shellView = shellView;
        this.currentDirectory = data;
        this.folderStack = [];
        this.commands = {
            'dir': () => this.listContent(),
            'cd': (args) => this.changeDirectory(args),
            'type': (args) => this.cat(args),
            'cls': () => this.clearScreen(),
            'help': () => this.help()
        };
    }

    processCommand(input) {
        const words = input.trim().split(' ');
        let command = '';
        let args = [];
        if (words.length > 0) {
            command = words[0].toLowerCase();
            args.push(...words.slice(1));
            this.parseCommand(command, args);
        }
    }

    parseCommand(command, args) {
        try {
            if (!!this.commands[command]) {
                this.commands[command](args);
            } else {
                throw Error("Nonexistent command!");
            }
        } catch (e) {
            throw e;
        }
    }

    // dir
    listContent() {
        let content = this.currentDirectory.content;
        let output = '<div>' +
            '<div><span>Directory of ' + this.computeCurrentPath() + '</span></div>';
        let sumFileSizes = 0;
        let countNumberOfFiles = 0;
        let countNumberOfDirectories = 0;
        for (let item of content) {
            let type, size;
            if (item.type === CONTENT_TYPE.DIR) {
                type = '&nbsp&nbsp&lt;DIR&gt;';
                size = '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
                countNumberOfDirectories++
            } else {
                type = '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
                size = formatNumber(item.size, 9);
                sumFileSizes += parseInt(item.size);
                countNumberOfFiles++;
            }
            output += `<div><span>${item.lastModified} ${type} ${size} ${item.name}</span></div>`;
        }
        output += '' +
            `<div>${countNumberOfFiles} File(s) ${sumFileSizes} bytes</div>` +
            `<div>${countNumberOfDirectories} Dir(s) ${Math.floor((Math.random() * 1000) + 1000)} bytes free</div>` +
            '</div>';
        this.shellView.showOutput(output);
    }

    // type [FILE]
    cat(arg) {
        if (arg.length > 0) {
            let filename = arg[0].trim();
            let files = this.currentDirectory.content.filter((item) => {
                return item.name === filename && item.type === CONTENT_TYPE.FILE;
            });
            if (files < 1) {
                throw Error(`File with the name ${filename} of does not exist!`);
            } else {
                this.shellView.showOutput(files[0].content);
            }
        } else {
            throw Error('Missing argument from command "cat"! Usage: cat [FILENAME]')
        }
    }

    // cd [DIR]
    changeDirectory(arg) {
        if (arg.length > 0) {
            let directoryName = arg[0].trim();
            if (directoryName === '..') {
                if (this.folderStack.length > 0) {
                    this.currentDirectory = this.folderStack.pop();
                }
            } else {
                let dirs = this.currentDirectory.content.filter((item) => {
                    return item.name === directoryName && item.type === CONTENT_TYPE.DIR;
                });
                if (dirs.length < 1) {
                    throw Error(`Directory with the name ${directoryName} of does not exist!`);
                } else {
                    this.folderStack.push(this.currentDirectory);
                    this.currentDirectory = dirs[0];
                }
            }
        } else {
            throw Error('Missing argument from command "cat"! Usage: cd [DIRNAME]')
        }
    }

    // cls
    clearScreen() {
        this.shellView.clearScreen();
    }

    // help
    help() {
        let output = '<div>Available commands: dir, type, cd, help.' +
            '<ul>' +
            '<li>dir: List the content of the current directory. Equivalent of "ls" commend under Unix systems.</li>' +
            '<li>type: Show the content of a file. Equivalent of "cat" commend under Unix systems. Usage: type [FILENAME]</li>' +
            '<li>cd: Navigate into a selected directory. Usage: cat [DIRNAME]. To navigate up: cat ..  </li>' +
            '<li>clear: Clear the current terminal input screen.  </li>' +
            '</ul>' +
            '</div>';
        this.shellView.showOutput(output);
    }

    // pwd
    computeCurrentPath() {
        let pwd = 'C:\\';
        if (this.folderStack.length > 0) {
            return pwd + this.folderStack
                    .map(item => item.name)
                    .reduce((accumulator, currentValue) => accumulator + '\\' + currentValue) +
                this.currentDirectory.name;
        }
        return pwd;
    }
}