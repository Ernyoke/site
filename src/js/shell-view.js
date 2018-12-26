'use strict';

import '../css/main.scss';
import {ShellController} from './shell-controller';
import {ShellService} from './shell-service';

export class ShellView {
    constructor(terminalWindow) {
        this.shellController = null;
        this.terminalWindow = terminalWindow;
        this.numberOfConsecutiveTabs = 0;
        this.originalInput = '';
    }

    setController(shellController) {
        this.shellController = shellController;
    }

    processGenericKeyEvent(event, func) {
        const prompt = event.target || {};
        const input = prompt.textContent.trim();
        try {
            func(input);
        } catch (e) {
            console.error(e);
            this.showError(e.message);
        }
        event.preventDefault();
        this.resetTabStatus();
    }

    processTabKeyEvent(event) {
        if (this.numberOfConsecutiveTabs === 0) {
            const prompt = event.target || {};
            this.originalInput = prompt.textContent;
        }
        this.shellController.estimateCommand(this.originalInput, this.numberOfConsecutiveTabs);
        this.numberOfConsecutiveTabs++;
        event.preventDefault();
    }

    resetTabStatus() {
        this.numberOfConsecutiveTabs = 0;
        this.originalInput = '';
    }

    keyPressEvent(event) {
        switch (event.keyCode) {
            // handle TAB key event
            case 9: {
                this.processTabKeyEvent(event);
                break;
            }
            // handle ENTER key event
            case 13: {
                this.processGenericKeyEvent(event, (input) => {
                    this.shellController.processCommand(input);
                });
                this.resetPrompt(event);
                break;
            }
            // handle UP key event
            case 38: {
                this.processGenericKeyEvent(event,(input) => {
                    this.shellController.historyBefore(input);
                });
                break;
            }
            // handle DOWN key event
            case 40: {
                this.processGenericKeyEvent(event,(input) => {
                    this.shellController.historyAfter(input);
                });
                break;
            }
            default: {
                this.resetTabStatus();
            }
        }
    }

    resetPrompt(event) {
        const prompt = event.target || {};
        const newPrompt = prompt.parentNode.cloneNode(true);
        const currentPath = this.shellController.computeCurrentPath();
        const newPwd = newPrompt.querySelector('.pwd') || {};
        newPwd.innerText = currentPath + '>';
        const newInput = newPrompt.querySelector('.input') || {};
        newInput.innerHTML = '';
        prompt.setAttribute('contenteditable', false);
        this.terminalWindow.appendChild(newPrompt);
        newInput.focus();
    }

    setPrompt(command) {
        const prompts = document.querySelectorAll('.prompt');
        if (prompts.length > 0) {
            const prompt = prompts[prompts.length - 1];
            const input = prompt.parentNode.querySelector('.input');
            input.innerHTML = command;
            input.focus();
        }
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
    const terminalWindow = document.getElementsByClassName('terminal')[0] || {};
    const loading = document.getElementById('loading') || {};

    const shellView = new ShellView(terminalWindow);

    terminalWindow.addEventListener('keydown', (event) => {
        shellView.keyPressEvent(event);
    });

    // Focus the last input whenever a click is done inside the terminal window.
    terminalWindow.addEventListener('mouseup', () => {
        const allInputs = document.querySelectorAll('.input');
        if (allInputs.length > 0) {
            const lastInput = allInputs[allInputs.length - 1];
            lastInput.focus();
        }
    });

    const shellService = new ShellService();
    shellService.getData().then(data => {
        const shellController = new ShellController(shellView, data);
        shellView.setController(shellController);
        loading.style.display = 'none';
    })
};

init();