export abstract class Component<U extends HTMLElement, T extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: U;
    element: T;

    protected constructor(templateEl: string, hostElement: string, beforeAfter: boolean, elementId?: string,) {
        this.templateElement = document.getElementById(templateEl) as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElement)! as U;

        const importedNode = document.importNode(
            this.templateElement.content,
            true
        );
        this.element = importedNode.firstElementChild as T;

        if (elementId) {
            this.element.id = elementId;
        }

        this.attach(beforeAfter);
    }

    private attach(afterBefore: boolean) {
        this.hostElement.insertAdjacentElement(afterBefore ? 'beforeend' : 'afterbegin', this.element);
    }

    abstract renderContent(): void;

    abstract configure(): void;

}
