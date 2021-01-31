import {Component} from "./base-component.js";
import {Dragtarget} from "../models/drag-drop.js";
import {Project, ProjectStatus} from "../models/project.js";
import {autobind} from "../decorators/autobind.js";
import {projectState} from "../state/project-state.js";
import {ProjectItem} from "./project-item.js";

// ProjectList Class
export class ProjectList extends Component<HTMLDivElement, HTMLElement>
    implements Dragtarget {
    assignedProjects: Project[];

    constructor(private type: 'active' | 'finished') {

        super('project-list', 'app', true, `${type}-projects`);

        this.assignedProjects = [];

        this.configure();
        this.renderContent();
    }

    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent =
            this.type.toUpperCase() + ' PROJECTS';
    }

    @autobind
    dragOverHandler(event: DragEvent) {
        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
            event.preventDefault();
            this.element.querySelector('ul')!.classList.add('droppable');
        }

    }

    @autobind
    dropHandler(event: DragEvent) {
        const prjId = event.dataTransfer!.getData('text/plain');
        projectState.moveProject(
            prjId,
            this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished
        )
    }

    @autobind
    dragLeaveHandler(_: DragEvent) {
        this.element.querySelector('ul')!.classList.remove('droppable');
    }

    configure() {
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('drop', this.dropHandler);
        this.element.addEventListener('dragleave', this.dragLeaveHandler);

        projectState.addListener((projects: Project[]) => {
            this.assignedProjects = projects.filter((project) => {
                    if (this.type === 'active') {
                        return project.status === ProjectStatus.Active;
                    } else
                        return project.status === ProjectStatus.Finished;
                }
            )
            this.renderProjects();
        });
    }

    private renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        listEl.innerHTML = '';
        for (const prjItem of this.assignedProjects) {
            new ProjectItem(listEl.id, prjItem);
        }
    }
}
