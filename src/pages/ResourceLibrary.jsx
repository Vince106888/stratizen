import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import ResourceCard from "../components/ResourceCard";
import ResourceForm from "../components/ResourceForm";
import "../styles/ResourceLibrary.css";

const ResourceLibrary = () => {
  const [resources, setResources] = useState([]);
  const [schools, setSchools] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const resSnap = await getDocs(collection(db, "resources"));
      const schoolSnap = await getDocs(collection(db, "schools"));
      const subjSnap = await getDocs(collection(db, "subjects"));

      setResources(resSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setSchools(schoolSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setSubjects(subjSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchData();
  }, []);

  const filtered = resources.filter(r =>
    (!selectedSchool || r.schoolId === selectedSchool) &&
    (!selectedSubject || r.subjectId === selectedSubject)
  );

  return (
    <div className="resource-library-container">
      <h1 className="resource-library-title">📚 Resource Library</h1>

      <div className="flex gap-4 mb-4">
        <select onChange={e => setSelectedSchool(e.target.value)} className="p-2 border">
          <option value="">All Schools</option>
          {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select onChange={e => setSelectedSubject(e.target.value)} className="p-2 border">
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="grid gap-4">
        {filtered.map(r => <ResourceCard key={r.id} resource={r} />)}
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">➕ Add Resource</h2>
        <ResourceForm schools={schools} subjects={subjects} />
      </div>
    </div>
  );
};

export default ResourceLibrary;
