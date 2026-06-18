window.addEventListener("load", () => {

    setTimeout(() => {
        alert("Welcome to the Adventure Escape Team Page!");
    }, 500);
});

const members = document.querySelectorAll(".member");

members.forEach(member => {

    member.addEventListener("click", () => {

        alert(
        member.querySelector("h3").innerText +
        " is part of the Adventure Escape Team!"
        );
    });
});