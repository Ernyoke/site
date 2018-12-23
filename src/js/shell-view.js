'use strict';

import '../css/main.scss';
import {ShellController} from './shell-controller';
import {ShellService} from './shell-service';

export class ShellView {
    constructor(terminalWindow) {
        this.shellController = null;
        this.terminalWindow = terminalWindow;
    }

    setController(shellController) {
        this.shellController = shellController;
    }

    keyPressEvent(event) {
        if (event.keyCode === 13) {
            const prompt = event.target || {};
            const input = prompt.textContent.trim();
            try {
                this.shellController.processCommand(input);
            } catch (e) {
                console.error(e);
                this.showError(e.message);
            }
            event.preventDefault();
            this.resetPrompt(prompt);
        }
    }

    resetPrompt(prompt) {
        const newPrompt = prompt.parentNode.cloneNode(true);
        prompt.setAttribute('contenteditable', false);
        this.terminalWindow.appendChild(newPrompt);
        const currentPath = this.shellController.computeCurrentPath();
        const newPwd = newPrompt.querySelector('.pwd') || {};
        newPwd.innerText = currentPath + '>';
        const newInput = newPrompt.querySelector('.input') || {};
        newInput.innerHTML = '';
        newInput.focus();
    }

    showOutput(output) {
        this.terminalWindow.innerHTML += (output + '<p></p>');
    }

    showError(errorMessage) {
        this.terminalWindow.innerHTML += errorMessage;
    }

    clearScreen() {
        this.terminalWindow.innerHTML = '';
    }
}

const init = () => {
    const terminalWindow = document.getElementById('terminal') || {};
    const loading = document.getElementById('loading') || {};

    const shellView = new ShellView(terminalWindow);

    terminalWindow.addEventListener('keypress', (event) => {
        shellView.keyPressEvent(event);
    });

    const shellService = new ShellService();
    shellService.getData().then(data => {
        const shellController = new ShellController(shellView, data);
        shellView.setController(shellController);

        loading.style.display = 'none';
    })
};

init();