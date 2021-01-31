import {Project, ProjectStatus} from "../models/project.js";

// type listener
type Listener<T> = (items: T[]) => void;

// Base class for general state
class State<T> {
    protected listeners: Listener<T>[] = [];

    constructor() {
    }

    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }
}

// Project State Management
class ProjectState extends State<Project> {
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {
        super();
    }

    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }

    addProject(title: string, description: string, numOfPeople: number) {
        const newProject = new Project(Math.random().toString(),
            title,
            description,
            numOfPeople,
            ProjectStatus.Active
        )

        this.projects.push(newProject);
        this.updateListeners();
    }

    moveProject(prjId: string, prjState: ProjectStatus) {
        const project = this.projects.find(project => prjId === project.id);

        if (project && project.status !== prjState) {
            project.status = prjState;
            this.updateListeners();
        }

    }

    private updateListeners() {
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}

export const projectState = ProjectState.getInstance();
