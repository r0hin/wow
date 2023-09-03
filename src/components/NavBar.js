import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { exitChat } from '../js/chats';

class NavBar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <button index="0" class="navBarButton active"><i class="bx bx-message-square-dots"></i><i class="bx bxs-message-square-dots"></i></button>
      <button index="1" id="open-modal" class="navBarButton"><i class="bx bx-plus"></i><i class="bx bx-plus"></i></button>
      <button index="2" class="navBarButton"><i class="bx bx-cog"></i><i class="bx bxs-cog"></i></button>
    `

    window.timeouts = [];

    $(`.navBarButton`).on('click', (ev) => {
      const button = $(ev.target).closest(".navBarButton")
      const index = parseInt(button.attr("index"));
      const tab = $(`.tab`).eq(index);
      
      if (index == 0) {
        if (tab.hasClass("active")) {
          exitChat();
        }
      }

      if (index == 1) {
        // Open modal instead of tab
        Haptics.impact({ style: ImpactStyle.Medium });
        return;
      }

      $(`.navBarButton`).removeClass("active");      
      button.addClass("active");

      if (tab.hasClass("active")) return;

      if (index == 2) {
        
      }

      const activeTab = $(`.tab.active`);
      const indexActive = parseInt(activeTab.attr("index"));
      
      tab.addClass("active");

      window.timeouts.forEach(timeout => {
        window.clearTimeout(timeout);
      })

      window.timeouts = [];

      // Reset all classes
      $(`.tab`).removeClass("startPositionLeft");
      $(`.tab`).removeClass("startPositionRight");
      $(`.tab`).removeClass("endPositionLeft");
      $(`.tab`).removeClass("endPositionRight");

      const direction = index > indexActive ? "right" : "left";

      // Play haptic
      Haptics.impact({ style: ImpactStyle.Light });

      switch (direction) {
        case "left":
          // The active tab needs to move right
          // The incoming tab needs to move right

          // Move incoming tab to the left of the screen
          tab.addClass("startPositionLeft");
          tab.removeClass("endPositionRight");
          const timeout1 = window.setTimeout(() => {
            tab.removeClass("startPositionLeft");
            tab.addClass("tabEndBounceLeft");
          }, 10);
          window.timeouts.push(timeout1);

          // Move active tab to the right of the screen
          activeTab.addClass("endPositionRight");

          const timeout2 = window.setTimeout(() => {
            activeTab.removeClass("active");
            activeTab.removeClass("endPositionRight");
            tab.removeClass("tabEndBounceLeft");
          }, 200)

          window.timeouts.push(timeout2);
          // tab.addClass("moveRightIn");
          break;
        case "right":
          // The active tab needs to move left
          // The incoming tab needs to move left

          // Move incoming tab to the right of the screen
          tab.addClass("startPositionRight");
          tab.removeClass("endPositionLeft");
          const timeout3 = window.setTimeout(() => {
            tab.removeClass("startPositionRight");
            tab.addClass("tabEndBounceRight");
          }, 10);

          window.timeouts.push(timeout3);

          // Move active tab to the left of the screen
          activeTab.addClass("endPositionLeft");

          const timeout4 = window.setTimeout(() => {
            activeTab.removeClass("active");
            activeTab.removeClass("endPositionLeft");
            tab.removeClass("tabEndBounceRight");
          }, 200)

          window.timeouts.push(timeout4);
          break;
        default:
          alert("Invalid direction.")
          break;
      }

      
    })
  }
}

customElements.define('nav-bar', NavBar);