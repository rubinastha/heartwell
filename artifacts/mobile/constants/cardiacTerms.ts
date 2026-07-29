export interface CardiacTerm {
  id: string;
  term: string;
  explanation: string;
  whyItMatters: string;
  category: 'condition' | 'procedure' | 'medication' | 'test' | 'symptom';
}

export const cardiacTerms: CardiacTerm[] = [
  {
    id: '1',
    term: 'Atrial Fibrillation (AFib)',
    explanation: 'An irregular, often rapid heart rhythm that occurs when the upper chambers of the heart beat chaotically and out of sync with the lower chambers. It can feel like a racing, fluttering, or pounding sensation in your chest.',
    whyItMatters: 'AFib increases your risk of stroke, heart failure, and other complications. With proper treatment — which may include medication, cardioversion, or ablation — most people can manage it well and live full lives.',
    category: 'condition',
  },
  {
    id: '2',
    term: 'Heart Failure',
    explanation: 'A condition where the heart cannot pump enough blood to meet the body\'s needs. This doesn\'t mean the heart has stopped — it means it\'s not working as efficiently as it should.',
    whyItMatters: 'Managing heart failure involves taking medications, watching salt and fluid intake, and monitoring symptoms like swelling or shortness of breath. Many people live full, active lives with heart failure.',
    category: 'condition',
  },
  {
    id: '3',
    term: 'Coronary Artery Disease (CAD)',
    explanation: 'A narrowing or blockage of the coronary arteries due to a buildup of plaque — a mix of cholesterol and other substances. This reduces blood flow to the heart muscle.',
    whyItMatters: 'CAD is the most common type of heart disease and a leading cause of heart attacks. Lifestyle changes, medication, and sometimes procedures like stenting can help manage it effectively.',
    category: 'condition',
  },
  {
    id: '4',
    term: 'Myocardial Infarction (Heart Attack)',
    explanation: 'A heart attack occurs when blood flow to part of the heart is blocked, causing heart muscle cells to die from lack of oxygen. Quick treatment is critical to minimize damage.',
    whyItMatters: 'Time is muscle — the faster a heart attack is treated, the less damage occurs. Knowing the signs (chest pain, arm or jaw pain, shortness of breath, nausea) can save your life or someone else\'s.',
    category: 'condition',
  },
  {
    id: '5',
    term: 'Angina',
    explanation: 'Chest pain or discomfort caused by reduced blood flow to the heart muscle. It often feels like pressure, squeezing, or tightness in the chest and may spread to the arm, neck, or jaw.',
    whyItMatters: 'Angina is a warning sign that your heart isn\'t getting enough blood. Stable angina is predictable and manageable; unstable angina is an emergency that needs immediate care.',
    category: 'symptom',
  },
  {
    id: '6',
    term: 'Arrhythmia',
    explanation: 'An abnormal heart rhythm — the heart beats too fast, too slow, or irregularly. Some arrhythmias are harmless; others are serious and require treatment.',
    whyItMatters: 'The type and severity of arrhythmia determines treatment. Monitoring your heart rhythm and recognizing symptom triggers helps your doctor fine-tune your care plan.',
    category: 'condition',
  },
  {
    id: '7',
    term: 'Bradycardia',
    explanation: 'A resting heart rate slower than 60 beats per minute. For some people (like athletes), this is normal, but for others it can cause fatigue, dizziness, or fainting.',
    whyItMatters: 'Severe bradycardia can reduce blood flow to the brain and vital organs. It may be treated with a pacemaker if it\'s causing symptoms or is dangerously slow.',
    category: 'condition',
  },
  {
    id: '8',
    term: 'Tachycardia',
    explanation: 'A heart rate faster than 100 beats per minute at rest. It can originate in the upper or lower chambers of the heart and may feel like palpitations, shortness of breath, or dizziness.',
    whyItMatters: 'Some tachycardias are harmless, while others can be life-threatening. Identifying the type and origin helps determine the right treatment — from medication to ablation.',
    category: 'condition',
  },
  {
    id: '9',
    term: 'Ejection Fraction (EF)',
    explanation: 'A measure of how much blood the heart pumps out with each beat, expressed as a percentage. A normal EF is 50–70%. A lower number means the heart is not pumping as efficiently.',
    whyItMatters: 'EF is a key number in understanding heart failure. Your cardiologist uses it to guide treatment decisions and monitor how your heart is responding to therapy over time.',
    category: 'test',
  },
  {
    id: '10',
    term: 'Echocardiogram',
    explanation: 'An ultrasound of the heart that creates real-time images of the heart\'s structure and function. It shows the size of the heart chambers, how well the valves work, and how effectively the heart pumps.',
    whyItMatters: 'The echo is one of the most useful tools for diagnosing and monitoring heart conditions. It\'s painless, uses no radiation, and gives your doctor a detailed picture of your heart health.',
    category: 'test',
  },
  {
    id: '11',
    term: 'Electrocardiogram (ECG/EKG)',
    explanation: 'A test that records the electrical activity of the heart as a graph of waves. Electrodes are placed on the chest, arms, and legs to detect heart rate, rhythm, and signs of damage.',
    whyItMatters: 'An ECG can detect arrhythmias, heart attacks (past or present), and other electrical problems. It\'s quick, painless, and often one of the first tests done when a heart problem is suspected.',
    category: 'test',
  },
  {
    id: '12',
    term: 'Hypertension (High Blood Pressure)',
    explanation: 'When the force of blood against artery walls is consistently too high. It\'s measured as systolic (during heartbeats) over diastolic (between beats). Normal is below 120/80 mmHg.',
    whyItMatters: 'Hypertension is often called the "silent killer" because it usually has no symptoms but quietly damages the heart, arteries, kidneys, and brain over time. Medication and lifestyle changes can control it.',
    category: 'condition',
  },
  {
    id: '13',
    term: 'Beta-Blocker',
    explanation: 'A type of medication that blocks the effects of adrenaline on the heart, slowing the heart rate and lowering blood pressure. Common examples include metoprolol, atenolol, and carvedilol.',
    whyItMatters: 'Beta-blockers reduce the heart\'s workload, protect against future heart attacks, and help manage arrhythmias and heart failure. Never stop taking them suddenly without medical guidance.',
    category: 'medication',
  },
  {
    id: '14',
    term: 'Anticoagulant (Blood Thinner)',
    explanation: 'Medication that prevents blood clots from forming or existing clots from growing. Common anticoagulants include warfarin (Coumadin), apixaban (Eliquis), and rivaroxaban (Xarelto).',
    whyItMatters: 'Anticoagulants greatly reduce stroke risk in people with AFib and other conditions. They require careful monitoring because bleeding is the main risk. Follow up regularly with your doctor.',
    category: 'medication',
  },
  {
    id: '15',
    term: 'Statin',
    explanation: 'A class of medications that lower LDL ("bad") cholesterol by reducing its production in the liver. Common statins include atorvastatin, rosuvastatin, and simvastatin.',
    whyItMatters: 'Statins have been shown to significantly reduce heart attacks and strokes in people at risk. Most people tolerate them well; muscle aches are the most common side effect to watch for.',
    category: 'medication',
  },
  {
    id: '16',
    term: 'Stent',
    explanation: 'A small mesh tube placed inside a narrowed or blocked artery to hold it open and restore blood flow. Drug-eluting stents release medication to prevent scar tissue from closing the artery again.',
    whyItMatters: 'After a stent is placed, antiplatelet medication is usually required for at least a year to prevent clots. Do not stop these medications without first consulting your cardiologist.',
    category: 'procedure',
  },
  {
    id: '17',
    term: 'Cardiac Catheterization',
    explanation: 'A procedure where a thin, flexible tube (catheter) is inserted through a blood vessel — usually in the wrist or groin — and guided to the heart to diagnose or treat heart conditions.',
    whyItMatters: 'A "cath" allows doctors to see the coronary arteries directly, measure pressures, and perform interventions like stenting — all through a small incision with minimal recovery time.',
    category: 'procedure',
  },
  {
    id: '18',
    term: 'Pacemaker',
    explanation: 'A small device implanted under the skin near the collarbone that sends electrical signals to the heart to keep it beating at a normal rate. It continuously monitors and responds to the heart\'s rhythm.',
    whyItMatters: 'Pacemakers are highly reliable and dramatically improve quality of life for people with certain arrhythmias or heart block. Regular check-ups ensure it\'s working correctly and the battery is adequate.',
    category: 'procedure',
  },
  {
    id: '19',
    term: 'Implantable Cardioverter-Defibrillator (ICD)',
    explanation: 'A device implanted in the chest that monitors heart rhythm and delivers an electric shock if it detects a life-threatening arrhythmia like ventricular fibrillation, instantly resetting the heart.',
    whyItMatters: 'An ICD can prevent sudden cardiac death. Living with one involves some activity adjustments and regular device checks — it\'s a safety net that many people find genuinely reassuring.',
    category: 'procedure',
  },
  {
    id: '20',
    term: 'Mitral Valve Prolapse',
    explanation: 'A condition where the mitral valve (between the heart\'s left chambers) doesn\'t close properly — one or both leaflets bulge slightly into the upper chamber. It\'s very common and usually harmless.',
    whyItMatters: 'Most people with mitral valve prolapse need no treatment and live completely normally. In rare cases it causes regurgitation (blood leaking backward) that may eventually need valve repair.',
    category: 'condition',
  },
  {
    id: '21',
    term: 'Aortic Stenosis',
    explanation: 'A narrowing of the aortic valve opening that restricts blood flow from the heart to the aorta and the rest of the body. It typically develops from calcium buildup on the valve over decades.',
    whyItMatters: 'Severe aortic stenosis is serious and may require valve replacement. Key symptoms — chest pain, fainting, breathlessness on exertion — signal that the valve needs evaluation soon.',
    category: 'condition',
  },
  {
    id: '22',
    term: 'Stroke',
    explanation: 'A medical emergency where blood supply to part of the brain is cut off, causing brain cells to die. This can be due to a blockage (ischemic stroke) or a burst blood vessel (hemorrhagic stroke).',
    whyItMatters: 'Remember F.A.S.T.: Face drooping, Arm weakness, Speech difficulty, Time to call emergency services. Certain heart conditions like AFib significantly raise stroke risk, which is why anticoagulants are prescribed.',
    category: 'condition',
  },
  {
    id: '23',
    term: 'Cardiomyopathy',
    explanation: 'Disease of the heart muscle that makes it harder for the heart to pump blood. The muscle may become thickened, stiff, or enlarged, reducing its ability to contract and relax normally.',
    whyItMatters: 'Treatment depends on the type and severity — ranging from medications to implanted devices. Most people with cardiomyopathy can lead active lives with the right monitoring and therapy.',
    category: 'condition',
  },
  {
    id: '24',
    term: 'Cardiac Rehabilitation',
    explanation: 'A medically supervised program combining exercise training, heart health education, and counseling to help people recover from heart attacks, surgery, or other heart conditions.',
    whyItMatters: 'Cardiac rehab significantly reduces the risk of another cardiac event and improves quality of life, endurance, and confidence. It\'s one of the most evidence-backed interventions in all of cardiology.',
    category: 'procedure',
  },
  {
    id: '25',
    term: 'BNP / NT-proBNP',
    explanation: 'Proteins released by the heart when it is under stress or working too hard. Blood levels of BNP are used as a marker for heart failure — elevated levels suggest the heart is under strain.',
    whyItMatters: 'BNP is used to diagnose heart failure and monitor how well treatment is working. As heart failure improves with therapy, BNP levels typically fall — it\'s a useful sign of progress.',
    category: 'test',
  },
];

export const CATEGORIES: CardiacTerm['category'][] = ['condition', 'medication', 'procedure', 'test', 'symptom'];

export const CATEGORY_LABELS: Record<CardiacTerm['category'], string> = {
  condition: 'Condition',
  medication: 'Medication',
  procedure: 'Procedure',
  test: 'Test',
  symptom: 'Symptom',
};
