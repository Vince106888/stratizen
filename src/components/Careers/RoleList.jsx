import React, { useState } from "react";
import RoleCard from "./RoleCard";
import Filters from "./Filters";

export default function RoleList({ roles }) {
  const [filter, setFilter] = useState("All");
  const filteredRoles = roles.filter(r => filter === "All" || r.tags.includes(filter));

  return (
    <section id="roles" className="roles-section">
      <h2 className="text-3xl font-bold text-center mb-6">Open Opportunities</h2>
      <Filters filter={filter} setFilter={setFilter} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {filteredRoles.map((role, idx) => <RoleCard key={idx} role={role} />)}
      </div>
    </section>
  );
}
