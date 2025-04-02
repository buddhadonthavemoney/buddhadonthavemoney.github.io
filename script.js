document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.querySelector('.terminal');
    const terminalContent = document.querySelector('.terminal-content');
    const commandInputContainer = document.querySelector('.command-input'); // Select the container
    const commandInputField = document.getElementById('command-input-field');
    const staticContent = document.querySelector('.static-content');
    let commandHistoryContainer = null; // Initialize as null

    // Select both buttons (in case either one is present)
    const desktopToggleButton = document.getElementById('interactive-toggle-btn');
    const mobileToggleButton = document.getElementById('mobile-interactive-toggle');
    
    console.log("Desktop button:", desktopToggleButton);
    console.log("Mobile button:", mobileToggleButton);

    // --- Helper Functions ---
    function ensureHistoryContainer() {
        if (!commandHistoryContainer) {
            commandHistoryContainer = document.createElement('div');
            commandHistoryContainer.className = 'command-history';
            terminalContent.insertBefore(commandHistoryContainer, document.querySelector('.command-input'));
        }
        return commandHistoryContainer;
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
        commandLine.innerHTML = `<span class="prompt">buddha@nixos:~$</span> ${command}`;
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
            - about: Readme<br>
            - tech: Tech Readme<br>
            - contact: Show contact links<br>
            - date: Show the current date and time<br>
            - clear: Clear the terminal screen<br>
            - echo [text]: Print back the text<br>
            - cowsay [text]: Show text with a cow<br>
            - books: Goodreads<br>
            - weekday: Weekdays readme<br>
            - weekend: Weekend readme`,

        'about': () => `I'm a Backend/DevOps Engineer working for a startup building cloud-based multi-tenant SaaS product. I love open source 
					and Linux systems (I use NixOS btw. You might know by now hahaha). Used to be a Neovim purist, but now I vibe with Cursor.`,
        'tech': () => `On the tech side, I'm fascinated by databases, self-hosting services, and homelab setups. The elegance
					of ACID-compliant systems — handling millions of updates and billions of reads in milliseconds — drives my 
					interest. I also enjoy building self-hosted solutions, from media streaming to personal cloud services, 
					optimizing for performance and reliability.`,
        'weekday': () => `I am a gym rat. Currently, I squat 110kg, bench 70kg, and deadlift 140kg — not where 
					I want to be, but getting stronger every day. Will definitely be a member of 1000lbs club one day.
                    In the very little time left in the day, I go through some hackernews and read some pages of a book.`,
        'weekend': () => `On weekends, you'll find me either on motorcycle rides exploring new places, or at a hillside cafe 
					with an americano and a good book.
					In the next few years, I plan to take my bike around the world. Reading books living on the road. 
					What else would a guy want.`,
        'books': () => `<div class="links">
            <a href="https://www.goodreads.com/user/show/157231739-buddhaa-gautam" target="_blank">
                <i class="fa fa-book"></i> Goodreads
            </a>`,

        'contact': () => `<div class="links">
            <a href="https://github.com/buddhadonthavemoney/" target="_blank">
                <i class="fab fa-github"></i> GitHub
            </a>
            <a href="https://www.linkedin.com/in/buddhagautam/" target="_blank">
                <i class="fab fa-linkedin"></i> LinkedIn
            </a>
            <a href="https://blog.buddhag.com.np" target="_blank">
                <i class="fas fa-blog"></i> Blog
            </a>
        </div>`,
        'date': () => new Date().toLocaleString(),
        'clear': () => { clearTerminal(); return null; }, // Special case for clear
        'echo': (args) => args.slice(1).join(' ') || 'Usage: echo [text]', // Pass args
        'cowsay': (args) => { // Pass args
            const text = args.slice(1).join(' ') || 'Moo!';
            return `<pre class="cowsay">< ${text} >\n    \\   ^__^\n     \\  (oo)\\_______\n        (__)\\       )\\/\\\n            ||----w |\n            ||     ||</pre>`;
        }
    };

    function setupCommandInputListener() {
        // Remove any existing listeners first to avoid duplicates
        commandInputField.removeEventListener('keydown', handleCommandInput);

        // Add the event listener
        commandInputField.addEventListener('keydown', handleCommandInput);
    }

    function handleCommandInput(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const command = commandInputField.value.trim();

            if (command) {
                // Debug log to see if this is being triggered
                console.log('Processing command:', command);

                processCommand(command);
                commandInputField.value = '';

                // Focus back on input after processing
                setTimeout(() => {
                    commandInputField.focus();
                }, 10);
            }
        }
    }

    function processCommand(command) {
        console.log('Command received:', command);

        // Add the command line to the history
        addCommandToHistory(command);

        const args = command.toLowerCase().trim().split(' ').filter(Boolean);
        const cmd = args[0];
        console.log('Command parsed:', cmd, args);

        if (commands[cmd]) {
            console.log('Command found in commands object');
            const result = commands[cmd](args);
            console.log('Command result:', result);

            if (result !== null) {
                // Add the response text/HTML to the history
                addResponseToHistory(result);
            }
        } else if (command) {
            console.log('Command not found');
            addResponseToHistory(`Command not found: ${command}. Type 'help' for available commands.`);
        }

        // Force scroll after processing
        scrollToBottom(true);
    }

    // --- Event Listeners ---
    // Remove the desktop mode toggle button event listener
    // interactiveToggleButton.addEventListener('click', () => {
    //     const isCurrentlyInteractive = terminal.classList.contains('interactive');
    //     
    //     if (isCurrentlyInteractive) {
    //         // --- Switching FROM Interactive TO Static ---
    //         terminal.classList.remove('interactive');
    //         interactiveToggleButton.classList.remove('active');
    //         interactiveToggleButton.textContent = 'Enter Interactive';
    //         clearTerminal(); // Clear history
    //         terminalContent.scrollTop = 0; // Reset scroll for static view
    //     } else {
    //         // --- Switching FROM Static TO Interactive ---
    //         terminal.classList.add('interactive');
    //         interactiveToggleButton.classList.add('active');
    //         interactiveToggleButton.textContent = 'Exit Interactive';
    //         
    //         // Ensure history container exists
    //         ensureHistoryContainer();
    //         
    //         // Add welcome message
    //         addResponseToHistory("Welcome to interactive mode! Type 'help' to see available commands.");
    //         
    //         // Make sure command input listener is set up
    //         setupCommandInputListener();
    //         
    //         // Focus and scroll with a slight delay to ensure DOM is updated
    //         setTimeout(() => {
    //             if (commandInputField) {
    //                 commandInputField.focus();
    //                 // Make sure it's not disabled
    //                 commandInputField.disabled = false;
    //             }
    //             scrollToBottom(true); // Force immediate scroll
    //         }, 100);
    //     }
    // });

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
        
        // Update both buttons instead of using toggleButton
        if (desktopToggleButton) {
            desktopToggleButton.classList.toggle('active', startInteractive);
            desktopToggleButton.textContent = startInteractive ? 'Exit Interactive' : 'Enter Interactive';
        }
        
        if (mobileToggleButton) {
            mobileToggleButton.classList.toggle('active', startInteractive);
        }
        
        // Set up the command input listener
        setupCommandInputListener();
        
        if (startInteractive) {
            ensureHistoryContainer();
            addResponseToHistory("Welcome to interactive mode! Type 'help' to see available commands.");
            
            setTimeout(() => {
                commandInputField.focus();
                scrollToBottom(true); // Force immediate scroll
            }, 100);
        }
    }

    setupInitialMode(); // Run on load

    // Use the title bar toggle button for all screen sizes
    const toggleButton = document.getElementById('mobile-interactive-toggle');
    
    console.log("Toggle button found:", toggleButton); // Debug log to verify button is found
    
    // Directly add click event to ensure it's working
    if (toggleButton) {
        console.log("Adding click event to toggle button");
        
        toggleButton.addEventListener('click', function(e) {
            console.log("Toggle button clicked"); // Debug log
            e.preventDefault(); // Prevent any default behavior
            
            const isCurrentlyInteractive = terminal.classList.contains('interactive');
            console.log("Currently interactive:", isCurrentlyInteractive);
            
            if (isCurrentlyInteractive) {
                // --- Switching FROM Interactive TO Static ---
                terminal.classList.remove('interactive');
                toggleButton.classList.remove('active');
                clearTerminal(); // Clear history
                terminalContent.scrollTop = 0; // Reset scroll for static view
            } else {
                // --- Switching FROM Static TO Interactive ---
                terminal.classList.add('interactive');
                toggleButton.classList.add('active');
                
                // Ensure history container exists
                ensureHistoryContainer();
                
                // Add welcome message
                addResponseToHistory("Welcome to interactive mode! Type 'help' to see available commands.");
                
                // Focus and scroll with a slight delay to ensure DOM is updated
                setTimeout(() => {
                    if (commandInputField) {
                        commandInputField.focus();
                        commandInputField.disabled = false;
                    }
                    scrollToBottom(true); // Force immediate scroll
                }, 50);
            }
        });
        
        // Also add a direct onclick attribute as a backup
        toggleButton.setAttribute('onclick', "console.log('Button clicked via onclick')");
    } else {
        console.error("Toggle button not found!");
    }

    // Create a single toggle function to handle interactive mode
    function toggleInteractiveMode() {
        console.log("Toggle function called");
        const isCurrentlyInteractive = terminal.classList.contains('interactive');
        console.log("Currently interactive:", isCurrentlyInteractive);
        
        if (isCurrentlyInteractive) {
            // --- Switching FROM Interactive TO Static ---
            console.log("Switching to static mode");
            terminal.classList.remove('interactive');
            
            // Update button states
            if (desktopToggleButton) {
                desktopToggleButton.classList.remove('active');
                desktopToggleButton.textContent = 'Enter Interactive';
            }
            if (mobileToggleButton) {
                mobileToggleButton.classList.remove('active');
            }
            
            clearTerminal(); // Clear history
            terminalContent.scrollTop = 0; // Reset scroll for static view
        } else {
            // --- Switching FROM Static TO Interactive ---
            console.log("Switching to interactive mode");
            
            // Clear any existing history first to prevent duplicates
            clearTerminal();
            
            terminal.classList.add('interactive');
            
            // Update button states
            if (desktopToggleButton) {
                desktopToggleButton.classList.add('active');
                desktopToggleButton.textContent = 'Exit Interactive';
            }
            if (mobileToggleButton) {
                mobileToggleButton.classList.add('active');
            }
            
            // Ensure history container exists
            ensureHistoryContainer();
            
            // Add welcome message (only once)
            addResponseToHistory("Welcome to interactive mode! Type 'help' to see available commands.");
            
            // Focus and scroll with a slight delay to ensure DOM is updated
            setTimeout(() => {
                if (commandInputField) {
                    commandInputField.focus();
                    commandInputField.disabled = false;
                }
                scrollToBottom(true); // Force immediate scroll
            }, 100);
        }
    }
    
    // Attach the toggle function to both buttons
    if (desktopToggleButton) {
        console.log("Adding click handler to desktop button");
        desktopToggleButton.addEventListener('click', toggleInteractiveMode);
    }
    
    if (mobileToggleButton) {
        console.log("Adding click handler to mobile button");
        mobileToggleButton.addEventListener('click', toggleInteractiveMode);
        
        // Add direct onclick attribute as a fallback
        mobileToggleButton.setAttribute('onclick', "document.querySelector('.terminal').classList.toggle('interactive'); this.classList.toggle('active');");
    }

}); // End of DOMContentLoaded 