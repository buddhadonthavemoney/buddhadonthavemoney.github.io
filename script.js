document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.querySelector('.terminal');
    const terminalContent = document.querySelector('.terminal-content');
    const commandInputContainer = document.querySelector('.command-input'); // Select the container
    const commandInputField = document.getElementById('command-input-field');
    const interactiveToggleButton = document.getElementById('interactive-toggle-btn'); // Get the button
    const staticContent = document.querySelector('.static-content');
    let commandHistoryContainer = null; // Initialize as null

    // --- Helper Functions ---
    function ensureHistoryContainer() {
        let historyContainer = document.querySelector('.command-history');
        
        if (!historyContainer) {
            historyContainer = document.createElement('div');
            historyContainer.className = 'command-history';
            
            // Insert before the command input if it exists
            const inputElement = document.querySelector('.command-input');
            if (inputElement && inputElement.parentNode) {
                inputElement.parentNode.insertBefore(historyContainer, inputElement);
            } else {
                // Fallback - add to terminal content
                terminalContent.appendChild(historyContainer);
            }
        }
        
        // Update the global variable
        commandHistoryContainer = historyContainer;
        return historyContainer;
    }

    // Modified scrollToBottom to allow immediate execution
    function scrollToBottom(immediate = false) {
        const scrollAction = () => {
            // Use scrollHeight to scroll all the way down
            terminalContent.scrollTop = terminalContent.scrollHeight;
        };

        if (immediate) {
            scrollAction();
            // Add a second call with a slight delay as a backup
            setTimeout(scrollAction, 10);
        } else {
            setTimeout(scrollAction, 50);
            // Add a second call with a longer delay as a backup
            setTimeout(scrollAction, 100);
        }
    }

    function addCommandToHistory(command) {
        const historyContainer = ensureHistoryContainer();
        const commandLine = document.createElement('div');
        commandLine.className = 'history-line command-line';
        commandLine.innerHTML = `<span class="prompt">buddha@nixos:~$</span> ${escapeHTML(command)}`;
        historyContainer.appendChild(commandLine);
        scrollToBottom(true);
    }

    function addResponseToHistory(responseHTML) {
        const historyContainer = ensureHistoryContainer();
        const responseLine = document.createElement('div');
        responseLine.className = 'history-line response-line';
        responseLine.innerHTML = responseHTML;
        historyContainer.appendChild(responseLine);
        scrollToBottom(true);
    }

    function clearTerminal() {
        if (commandHistoryContainer) {
            commandHistoryContainer.innerHTML = ''; // Clear only the history
        }
        // No need to scroll to top here, as it's cleared.
    }

    // --- Command Processing ---
    const commands = {
        'help': () => `Available commands:<br>
            - help: Show this help message<br>
            - about: Display info about me<br>
            - tech: Show tech interests<br>
            - contact: Show contact links<br>
            - date: Show the current date and time<br>
            - clear: Clear the terminal screen<br>
            - echo [text]: Print back the text<br>
            - cowsay [text]: Show text with a cow`,
        'about': () => `I'm a Backend/DevOps Engineer... (You can copy the full text here or load dynamically)`,
        'tech': () => `Fascinated by databases, self-hosting, NixOS... (Full text)`,
        'contact': () => `Find me on:<br>
            - <a href="https://github.com/buddhadonthavemoney/" target="_blank">GitHub</a><br>
            - <a href="https://www.linkedin.com/in/buddhagautam/" target="_blank">LinkedIn</a><br>
            - <a href="https://blog.buddhag.com.np" target="_blank">Blog</a>`,
        'date': () => new Date().toLocaleString(),
        'clear': () => { clearTerminal(); return null; }, // Special case for clear
        'echo': (args) => args.slice(1).join(' ') || 'Usage: echo [text]', // Pass args
        'cowsay': (args) => { // Pass args
            const text = args.slice(1).join(' ') || 'Moo!';
            const cow = `
    \\   ^__^
     \\  (oo)\\_______
        (__)\\       )\\/\\
            ||----w |
            ||     ||`;
            const border = '_'.repeat(text.length + 2);
            return `<pre class="cowsay"> ${border}\n< ${text} >\n ${'-'.repeat(text.length + 2)}${cow}</pre>`;
        }
    };

    function processCommand(command) {
        // Add the command line to the history
        addCommandToHistory(command);

        const args = command.toLowerCase().trim().split(' ').filter(Boolean);
        const cmd = args[0];

        if (commands[cmd]) {
            const result = commands[cmd](args);
            if (result !== null) {
                // Add the response text/HTML to the history
                addResponseToHistory(result);
            }
        } else if (command) {
            addResponseToHistory(`Command not found: ${command}. Type 'help' for available commands.`);
        }

        // Force scroll after processing
        scrollToBottom(true);
    }


    // --- Event Listeners ---
    interactiveToggleButton.addEventListener('click', () => {
        const isCurrentlyInteractive = terminal.classList.contains('interactive');

        if (isCurrentlyInteractive) {
            // --- Switching FROM Interactive TO Static ---
            terminal.classList.remove('interactive');
            interactiveToggleButton.classList.remove('active');
            interactiveToggleButton.textContent = 'Enter Interactive';
            clearTerminal(); // Clear history
            terminalContent.scrollTop = 0; // Reset scroll for static view
        } else {
            // --- Switching FROM Static TO Interactive ---
            terminal.classList.add('interactive');
            interactiveToggleButton.classList.add('active');
            interactiveToggleButton.textContent = 'Exit Interactive';
            
            // Ensure history container exists
            ensureHistoryContainer();
            
            // Add welcome message
            addResponseToHistory("Welcome to interactive mode! Type 'help' to see available commands.");
            
            // Focus and scroll with a slight delay to ensure DOM is updated
            setTimeout(() => {
                if (commandInputField) {
                    commandInputField.focus();
                    // Make sure it's not disabled
                    commandInputField.disabled = false;
                }
                scrollToBottom(true); // Force immediate scroll
            }, 100);
        }
    });

    commandInputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const command = commandInputField.value.trim();
            
            if (command) {
                processCommand(command);
                commandInputField.value = '';
                
                // Focus back on input after processing
                setTimeout(() => {
                    commandInputField.focus();
                }, 10);
            }
        }
    });

    // Focus input when clicking inside terminal area (but DON'T force scroll here)
    terminalContent.addEventListener('click', (event) => {
        if (terminal.classList.contains('interactive')) {
            // Check if the click target is appropriate for focusing the input
            const targetIsInput = event.target === commandInputField || commandInputField.contains(event.target);
            const targetIsHistoryArea = event.target === terminalContent || event.target === commandHistoryContainer || event.target.closest('.command-history');
            const targetIsLink = event.target.tagName === 'A' || event.target.closest('a');

            if (!targetIsInput && targetIsHistoryArea && !targetIsLink) {
                commandInputField.focus(); // Focus the input
                // REMOVED: scrollToBottom(true); - Don't force scroll just on click
            }
        }
    });

    // Scroll immediately ONLY when the input field gains focus directly
    // (This combats the browser potentially scrolling to the top on focus)
    commandInputField.addEventListener('focus', () => {
        if (terminal.classList.contains('interactive')) {
             scrollToBottom(true);
        }
    });

    // --- Initial Setup ---
    function setupInitialMode() {
        const startInteractive = false; // Keep default as false for now

        terminal.classList.toggle('interactive', startInteractive);
        interactiveToggleButton.classList.toggle('active', startInteractive);
        interactiveToggleButton.textContent = startInteractive ? 'Exit Interactive' : 'Enter Interactive';

        if (startInteractive) {
            ensureHistoryContainer();
            // Add welcome message instead of help
            addResponseToHistory("Welcome to interactive mode! Type 'help' to see available commands.");
            
            setTimeout(() => {
                commandInputField.focus();
                scrollToBottom(true); // Force immediate scroll
            }, 100);
        }
    }

    setupInitialMode(); // Run on load

}); // End of DOMContentLoaded 