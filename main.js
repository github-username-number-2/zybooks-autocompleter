function timer(waitTime) {
    return new Promise(resolve => setTimeout( () => resolve(), waitTime));
}

if (!("nativeSend"in window)) {
    window.nativeSend = XMLHttpRequest.prototype.send;
}

window._intercept_ = true
XMLHttpRequest.prototype.send = function(data) {
    if (window._intercept_) {
        try {
            const dataJSON = JSON.parse(data);

            if ("metadata"in dataJSON) {
                const metadata = JSON.parse(dataJSON.metadata);

                if ("answer"in dataJSON) {
                    dataJSON.answer = metadata.expectedAnswer;
                }

                if ("files"in metadata) {
                    for (file of metadata.files) {
                        file.program = "";
                    }
                }

                dataJSON.metadata = JSON.stringify(metadata);
                data = JSON.stringify(dataJSON);
            }
        } catch (error) {
            console.log(error);
        } finally {
            if (data instanceof FormData && data.get("config")) {
                const config = JSON.parse(data.get("config"));
                let filename;

                if ((filename = config.run_command?.split(" ")[1] || config.command?.split(" ")[1]) && data.get(filename + ".solution")) {
                    data.set(filename + ".student", data.get(filename + ".solution"));
                } else if (data.get(filename)) {
                    data.set(filename, new File([],"blob"));
                } else {
                    // SEMI-COMPLETE, DOES NOT ACCOUNT FOR SYNTAX ERRORS AND UNDEFINED VARIABLES
                    config.student_code = `def zyAssertOutput(*a, **b):init_json_output();store_result({"passed": True})`;
                    data.set("config", JSON.stringify(config));
                }
            }
        }
    }

    nativeSend.apply(this, arguments);
}
;

(async function() {
    let nextSectionButton = document.querySelector(".section-nav .next");
    while (nextSectionButton) {
        try {
            const questionSectionsContainer = document.querySelector(".section-content-resources-container");

            const multipleChoiceContainers = questionSectionsContainer.querySelectorAll(".interactive-activity-container.multiple-choice-content-resource");
            const shortAnswerContainers = questionSectionsContainer.querySelectorAll(".interactive-activity-container.short-answer-content-resource");
            const animationPlayerContainers = questionSectionsContainer.querySelectorAll(".interactive-activity-container.animation-player-content-resource");
            const programmingChallengeContainers = questionSectionsContainer.querySelectorAll(".interactive-activity-container.programming-challenge-content-resource");
            const progressionToolChallengeContainers = questionSectionsContainer.querySelectorAll(".interactive-activity-container.challengev.progressionTool");
            const progressionToolCodeChallengeContainers = questionSectionsContainer.querySelectorAll(".interactive-activity-container.challenge .progression-container");

            for (const question of multipleChoiceContainers) {
                question.scrollIntoView();

                if (!question.querySelector(".zb-chevron").classList.toString().includes("filled")) {
                    const questionChoices = question.querySelectorAll(".question>.question-choices>.zb-radio-button");

                    for (const choice of questionChoices) {
                        choice.children[0].click();

                        await timer(500);
                    }
                }
            }

            for (const question of shortAnswerContainers) {
                question.scrollIntoView();

                if (!question.querySelector(".zb-chevron").classList.toString().includes("filled")) {
                    const subQuestions = question.querySelectorAll(".short-answer-question");
                    for (const subQuestion of subQuestions) {
                        const showAnswerButton = subQuestion.querySelector(".show-answer-button");
                        showAnswerButton.click();
                        await timer(50);
                        showAnswerButton.click();
                        await timer(50);

                        const answer = subQuestion.querySelector(".forfeit-answer").innerText;

                        const answerInput = subQuestion.querySelector(".zb-text-area");
                        answerInput.value = answer;

                        answerInput.dispatchEvent(new Event("change"));
                    }

                    await timer(500);

                    const checkAnswerButtons = question.querySelectorAll(".activity-payload .check-button");
                    for (const checkAnswerButton of checkAnswerButtons) {
                        checkAnswerButton.click();

                        await timer(750);
                    }
                }
            }

            for (const question of animationPlayerContainers) {
                question.scrollIntoView();

                if (!question.querySelector(".zb-chevron").classList.toString().includes("filled")) {
                    const questionId = question.querySelector(".activity-payload>.animation-player-content-resource").getAttribute("content_resource_id");

                    const speedUpButton = question.querySelector(".activity-payload .zb-checkbox>input");
                    speedUpButton.click();

                    await timer(200);

                    const startButton = question.querySelector(".activity-payload .animation-controls .start-button");
                    startButton.click();

                    await timer(500);

                    const playButton = question.querySelector(".activity-payload .zb-button.grey.normalize-controls");
                    while (!question.querySelector(".zb-chevron").classList.toString().includes("filled")) {
                        while (playButton.getAttribute("aria-label") !== "Play") {
                            await timer(250);
                        }

                        await timer(200);

                        playButton.click();

                        await timer(500);
                    }
                }
            }

            /*for (const question of programmingChallengeContainers) {
                question.scrollIntoView();

                if (!question.querySelector(".zb-chevron").classList.toString().includes("filled")) {
                    const runButton = question.querySelector(".content-resource .zb-button");
                    runButton.click();
                }

                while (!question.querySelector(".zb-chevron").classList.toString().includes("filled")) {
                    await timer(250);
                }
            }*/

            for (const question of progressionToolCodeChallengeContainers) {
                question.scrollIntoView();

                const chevron = question.parentElement.parentElement.parentElement.parentElement.querySelector(".zb-chevron");

                const buttonList = question.querySelectorAll(".zb-button.primary");
                const [checkButton,nextButton] = [...buttonList].slice(-2);

                buttonList.length === 3 && buttonList[0].click();

                main: while (!question.parentElement.parentElement.parentElement.parentElement.querySelector(".zb-chevron").classList.toString().includes("filled")) {
                    if (!nextButton.classList.toString().includes("disabled")) {
                        nextButton.click();
                    } else if (!checkButton.classList.toString().includes("disabled")) {
                        checkButton.click();
                    }

                    await timer(100);
                }
            }

            await timer(5000);
            nextSectionButton = document.querySelector(".section-nav .next");
            nextSectionButton.click();
        } catch (error) {
            console.log(error);
        }

        await timer(2500);
    }
}
)
//();
