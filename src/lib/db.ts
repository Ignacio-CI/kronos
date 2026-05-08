import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Project, Entry } from "@/types";

// Collections
const projectsCollection = collection(db, "projects");
const entriesCollection = collection(db, "entries");

// --- Projects ---

export const subscribeToProjects = (callback: (projects: Project[]) => void) => {
  const q = query(projectsCollection);
  return onSnapshot(q, (snapshot) => {
    const projects: Project[] = [];
    snapshot.forEach((doc) => {
      projects.push(doc.data() as Project);
    });
    callback(projects);
  });
};

export const saveProjectToDb = async (project: Project) => {
  const docRef = doc(projectsCollection, project.id);
  await setDoc(docRef, project);
};

export const deleteProjectFromDb = async (projectId: string) => {
  const docRef = doc(projectsCollection, projectId);
  await deleteDoc(docRef);
};

// --- Entries ---

export const subscribeToEntries = (callback: (entries: Entry[]) => void) => {
  const q = query(entriesCollection);
  return onSnapshot(q, (snapshot) => {
    const entries: Entry[] = [];
    snapshot.forEach((doc) => {
      entries.push(doc.data() as Entry);
    });
    callback(entries);
  });
};

export const saveEntryToDb = async (entry: Entry) => {
  const docRef = doc(entriesCollection, entry.id);
  await setDoc(docRef, entry);
};

export const deleteEntryFromDb = async (entryId: string) => {
  const docRef = doc(entriesCollection, entryId);
  await deleteDoc(docRef);
};
