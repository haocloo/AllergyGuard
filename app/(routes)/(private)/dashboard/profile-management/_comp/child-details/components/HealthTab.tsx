// HealthTab.tsx - For health information tab
export function HealthTab({
  child,
  onSave,
}: {
  child: ExtendedChild;
  onSave: (section: string) => void;
}) {
  const [editingSection, setEditingSection] = useState<'allergies' | 'symptoms' | null>(null);

  return (
    <TabsContent value="health" className="space-y-6 pt-4">
      <AllergiesSection
        allergies={child.allergies}
        onEdit={() => setEditingSection('allergies')}
        onSave={() => onSave('allergies')}
      />
      <SymptomsSection
        symptoms={child.symptoms}
        onEdit={() => setEditingSection('symptoms')}
        onSave={() => onSave('symptoms')}
      />
    </TabsContent>
  );
}
