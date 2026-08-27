import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import type { WasteAnalysisResponse } from '@/services/ai';

const HAZARD_STYLES: Record<string, { bg: string; border: string; text: string; label: string }> = {
  low: { bg: '#DCFCE7', border: '#86EFAC', text: '#065F46', label: 'Low Risk' },
  medium: { bg: '#FEF3C7', border: '#FDE68A', text: '#92400E', label: 'Medium Risk' },
  high: { bg: '#FFEDD5', border: '#FDBA74', text: '#9A3412', label: 'High Risk' },
  critical: { bg: '#FEE2E2', border: '#FECACA', text: '#991B1B', label: 'Critical Risk' },
};

const MATERIAL_COLORS = ['#0EA5E9','#F59E0B','#22C55E','#A78BFA','#EF4444','#14B8A6','#EC4899','#84CC16','#F97316','#6366F1','#EAB308','#06B6D4'];
export const colorForMaterial = (i:number)=> MATERIAL_COLORS[i % MATERIAL_COLORS.length];
const hazardColor = (l:string)=> HAZARD_STYLES[l] ?? HAZARD_STYLES.low;

function polarToCartesian(cx:number, cy:number, r:number, angle:number){
  const rad = (angle-90)*Math.PI/180;
  return { x: cx + r*Math.cos(rad), y: cy + r*Math.sin(rad) };
}
function describeArc(cx:number, cy:number, r:number, start:number, end:number){
  const s = polarToCartesian(cx,cy,r,end);
  const e = polarToCartesian(cx,cy,r,start);
  const large = end-start <= 180 ? 0 : 1;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
}

function HazardGauge({ score, level }: { score:number; level:string }){
  const st = hazardColor(level);
  const r=42, circ=2*Math.PI*r;
  const filled = Math.min(100,Math.max(0,score))/100 * circ;
  return (
    <View style={{ width:110, height:110 }}>
      <Svg width="110" height="110" viewBox="0 0 100 100">
        <Circle cx={50} cy={50} r={r} fill="none" stroke="#E5E7EB" strokeWidth={9} />
        <Circle cx={50} cy={50} r={r} fill="none" stroke={st.text} strokeWidth={9} strokeLinecap="round" strokeDasharray={`${filled} ${circ-filled}`} rotation={-90} origin="50,50" />
      </Svg>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
          <Text style={{ fontSize:22, fontWeight:'800', color: st.text }}>{score}</Text>
          <Text style={{ fontSize:9, fontWeight:'700', color: st.text }}>{st.label.toUpperCase()}</Text>
        </View>
      </View>
    </View>
  );
}

function Chip({ children, tone='default' }: { children:React.ReactNode; tone?:'default'|'danger'|'eco'}){
  const map:any={
    default:{bg:'#F3F4F6',border:'#E5E7EB',text:'#111827'},
    danger:{bg:'#FEE2E2',border:'#FECACA',text:'#991B1B'},
    eco:{bg:'#DCFCE7',border:'#BBF7D0',text:'#065F46'},
  };
  const c=map[tone];
  return <View style={{ backgroundColor:c.bg, borderColor:c.border, borderWidth:1, paddingHorizontal:8, paddingVertical:3, borderRadius:9999, flexDirection:'row', alignItems:'center', gap:4 }}>{typeof children==='string'?<Text style={{fontSize:11, color:c.text, fontWeight:'600'}}>{children}</Text>:children}</View>;
}

function SectionList({ icon, title, items, tone }:{icon:React.ReactNode; title:string; items:string[]; tone?:'danger'|'eco'}){
  if(!items.length) return null;
  return (
    <View style={{ gap:6 }}>
      <View style={{ flexDirection:'row', gap:6, alignItems:'center' }}>{icon}<Text style={{ fontSize:11, fontWeight:'700', color:'#6B7280', letterSpacing:0.4 }}>{title.toUpperCase()}</Text></View>
      {items.map((it,i)=>(
        <View key={i} style={{ flexDirection:'row', gap:8, alignItems:'flex-start' }}>
          <View style={{ width:6, height:6, borderRadius:3, marginTop:6, backgroundColor: tone==='danger'?'#EF4444':tone==='eco'?'#10B981':'#9CA3AF' }} />
          <Text style={{ flex:1, fontSize:12, color:'#111827', lineHeight:16 }}>{it}</Text>
        </View>
      ))}
    </View>
  );
}

function MaterialCard({ material, index }:{ material:any; index:number }){
  const [open,setOpen]=useState(index<2);
  const hs = hazardColor(material.hazard.level);
  const color = colorForMaterial(index);
  return (
    <View style={m.card}>
      <Pressable onPress={()=>setOpen(v=>!v)} style={m.head}>
        <View style={[m.pctBox,{ backgroundColor: color+'18', borderColor: color+'55'}]}>
          <Text style={[m.pctText,{color}]}>{Number(material.percentage).toFixed(0)}%</Text>
        </View>
        <View style={{ flex:1 }}>
          <View style={{ flexDirection:'row', gap:6, alignItems:'center', flexWrap:'wrap' }}>
            <Text style={m.name}>{material.name}</Text>
            <View style={m.catChip}><Text style={m.catText}>{String(material.category).replace('_','-')}</Text></View>
          </View>
          <View style={{ flexDirection:'row', gap:6, marginTop:4, flexWrap:'wrap', alignItems:'center' }}>
            <View style={[m.hazardChip,{ backgroundColor: hs.bg, borderColor: hs.border }]}><Text style={[m.hazardChipText,{color:hs.text}]}>{hs.label} · {material.hazard.score}/100</Text></View>
            <Text style={m.conf}>{(material.confidence*100).toFixed(0)}% conf</Text>
            {material.disposal?.recyclable && <View style={{ flexDirection:'row', gap:4, alignItems:'center' }}><Ionicons name="refresh" size={12} color="#0EA5E9"/><Text style={{ fontSize:11, color:'#0EA5E9', fontWeight:'700'}}>Recyclable</Text></View>}
          </View>
        </View>
        <Ionicons name={open?'chevron-up':'chevron-down'} size={16} color="#9CA3AF" />
      </Pressable>
      {open && (
        <View style={m.body}>
          {material.description ? <Text style={m.desc}>{material.description}</Text> : null}
          <View style={m.barTrack}><View style={[m.barFill,{ width:`${Math.min(100,material.percentage)}%`, backgroundColor: color }]} /></View>
          <Text style={m.barLabel}>{Number(material.percentage).toFixed(1)}% of pile</Text>
          {material.hazard?.toxins?.length>0 && (
            <View style={{ gap:6 }}>
              <View style={{ flexDirection:'row', gap:6, alignItems:'center' }}><Ionicons name="flask" size={14} color="#F97316"/><Text style={m.subTitle}>Toxins & Harmful Compounds</Text></View>
              <View style={{ flexDirection:'row', flexWrap:'wrap', gap:6 }}>{material.hazard.toxins.map((t:string,i:number)=><View key={i} style={[m.toxinChip]}><Text style={m.toxinText}>{t}</Text></View>)}</View>
            </View>
          )}
          <View style={{ flexDirection:'row', gap:16, flexWrap:'wrap' }}>
            <View style={{ flex:1, minWidth:140 }}><SectionList icon={<Ionicons name="warning" size={14} color="#F59E0B"/>} title="Health Risks" items={material.hazard.health_risks||[]} tone="danger" /></View>
            <View style={{ flex:1, minWidth:140 }}><SectionList icon={<Ionicons name="bulb" size={14} color="#A78BFA"/>} title="Common Uses" items={material.common_uses||[]} /></View>
          </View>
          <View style={{ flexDirection:'row', gap:16, flexWrap:'wrap' }}>
            <View style={{ flex:1, minWidth:140 }}><SectionList icon={<Ionicons name="repeat" size={14} color="#10B981"/>} title="Reuse / Upcycle" items={material.reuse_ideas||[]} tone="eco" /></View>
            <View style={{ flex:1, minWidth:140 }}><SectionList icon={<Ionicons name="leaf" size={14} color="#22C55E"/>} title="Eco Alternatives" items={material.eco_alternatives||[]} tone="eco" /></View>
          </View>
          {material.disposal && (
            <View style={[m.disposalBox,{ backgroundColor: hs.bg, borderColor: hs.border }]}>
              <View style={{ flexDirection:'row', gap:6, alignItems:'center' }}><Ionicons name="location" size={14} color={hs.text}/><Text style={[m.disposalTitle,{color:hs.text}]}>Disposal & Where It Can Go</Text></View>
              <Text style={m.disposalText}><Text style={m.disposalLabel}>Method: </Text>{material.disposal.method}</Text>
              <Text style={m.disposalText}><Text style={m.disposalLabel}>Destination: </Text>{material.disposal.destination}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function CompositionChart({ materials }:{ materials:any[] }){
  const sorted=[...materials].sort((a,b)=>b.percentage-a.percentage);
  const total=sorted.reduce((s,m)=>s+m.percentage,0)||1;
  let acc=0;
  const cx=80, cy=80, r=62, inner=38;
  return (
    <View style={m.chartCard}>
      <Text style={m.chartTitle}>Material Composition</Text>
      <Text style={m.chartSub}>Share of pile by visible mass / volume</Text>
      <View style={{ alignItems:'center', justifyContent:'center', marginTop:8 }}>
        <Svg width={160} height={160} viewBox="0 0 160 160">
          {sorted.map((mat,i)=>{
            const start=acc; const sweep=(mat.percentage/total)*360; acc+=sweep; const end=start+sweep;
            const col=colorForMaterial(i);
            const large = sweep>180?1:0;
            const s = polarToCartesian(cx,cy,r,end);
            const e = polarToCartesian(cx,cy,r,start);
            const si = polarToCartesian(cx,cy,inner,end);
            const ei = polarToCartesian(cx,cy,inner,start);
            const d=`M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y} L ${ei.x} ${ei.y} A ${inner} ${inner} 0 ${large} 1 ${si.x} ${si.y} Z`;
            return <Path key={i} d={d} fill={col} stroke="#FFFFFF" strokeWidth={2} />;
          })}
          {/* center hole */}
        </Svg>
      </View>
      <View style={{ flexDirection:'row', flexWrap:'wrap', gap:6, justifyContent:'center', marginTop:8 }}>
        {sorted.map((mat,i)=>(
          <View key={i} style={{ flexDirection:'row', gap:4, alignItems:'center' }}>
            <View style={{ width:8, height:8, borderRadius:4, backgroundColor: colorForMaterial(i) }} />
            <Text style={{ fontSize:10, color:'#6B7280' }}>{mat.name.length>18?mat.name.slice(0,18)+'…':mat.name} {Number(mat.percentage).toFixed(1)}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function WasteAnalysisResults({ result }:{ result:WasteAnalysisResponse }){
  const hs = hazardColor(result.overall_hazard.level);
  return (
    <View style={{ gap:16 }}>
      {/* Summary + gauge — exact desktop card */}
      <View style={[m.summaryCard,{ borderColor: hs.border, backgroundColor:'#FFFFFF'}]}>
        <View style={{ flexDirection:'row', gap:16, alignItems:'flex-start', flexWrap:'wrap' }}>
          <HazardGauge score={result.overall_hazard.score} level={result.overall_hazard.level} />
          <View style={{ flex:1, minWidth:180, gap:6 }}>
            <View style={{ flexDirection:'row', gap:8, alignItems:'center', flexWrap:'wrap' }}>
              <Text style={m.summaryTitle}>Analysis Complete</Text>
              {result.estimated_decomposition ? <View style={m.decompChip}><Ionicons name="hourglass" size={12} color="#6B7280"/><Text style={m.decompText}>Longest-lived: {result.estimated_decomposition}</Text></View> : null}
            </View>
            <Text style={m.summaryText}>{result.summary}</Text>
            {(result.overall_hazard.toxins.length>0 || result.overall_hazard.health_risks.length>0) && (
              <View style={{ gap:4, marginTop:4 }}>
                {result.overall_hazard.toxins.length>0 && <Text style={m.toxinsLine}><Text style={[m.toxinsBold,{color:hs.text}]}>Key toxins: </Text><Text style={{color:'#111827'}}>{result.overall_hazard.toxins.join(', ')}</Text></Text>}
                {result.overall_hazard.health_risks.length>0 && <Text style={m.toxinsLine}><Text style={[m.toxinsBold,{color:hs.text}]}>Main health concerns: </Text><Text style={{color:'#111827'}}>{result.overall_hazard.health_risks.slice(0,3).join(' · ')}</Text></Text>}
              </View>
            )}
            <Text style={m.metaLine}>Analyzed by {result.analyzer_model||'AI vision'} · {result.materials.length} material{result.materials.length!==1?'s':''} · {(result.processing_time_ms/1000).toFixed(1)}s</Text>
          </View>
        </View>
      </View>

      {/* Composition + Recommendations side by side (stacked on narrow) */}
      <View style={{ gap:12 }}>
        <CompositionChart materials={result.materials} />
        <View style={m.recCard}>
          <View style={{ flexDirection:'row', gap:6, alignItems:'center', marginBottom:8 }}><Ionicons name="shield-checkmark" size={16} color="#0EA5E9"/><Text style={m.recTitle}>What You Should Do</Text></View>
          {result.recommendations.map((rec,i)=>(
            <View key={i} style={{ flexDirection:'row', gap:8, marginTop:8 }}>
              <View style={m.recNum}><Text style={m.recNumText}>{i+1}</Text></View>
              <Text style={m.recText}>{rec}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={m.breakdownTitle}>Material-by-Material Breakdown</Text>
      {result.materials.map((mat,i)=><MaterialCard key={`${mat.name}-${i}`} material={mat} index={i} />)}

      {result.environmental_impact ? (
        <View style={[m.impactCard]}>
          <View style={{ flexDirection:'row', gap:6, alignItems:'center', marginBottom:6 }}><Ionicons name="warning" size={16} color="#92400E"/><Text style={m.impactTitle}>Environmental Impact If Not Managed</Text></View>
          <Text style={m.impactText}>{result.environmental_impact}</Text>
        </View>
      ) : null}
    </View>
  );
}

const m = StyleSheet.create({
  summaryCard:{ borderWidth:1, borderRadius:12, padding:14, gap:8 },
  summaryTitle:{ fontSize:14, fontWeight:'700', color:'#111827' },
  summaryText:{ fontSize:13, color:'#111827', lineHeight:18 },
  decompChip:{ flexDirection:'row', gap:4, alignItems:'center', backgroundColor:'#F3F4F6', borderWidth:1, borderColor:'#E5E7EB', paddingHorizontal:8, paddingVertical:3, borderRadius:9999 },
  decompText:{ fontSize:11, color:'#6B7280' },
  toxinsLine:{ fontSize:12, color:'#6B7280', lineHeight:16 },
  toxinsBold:{ fontWeight:'700' },
  metaLine:{ fontSize:10, color:'#9CA3AF', marginTop:2 },
  chartCard:{ borderWidth:1, borderColor:'#E5E7EB', borderRadius:12, padding:12, backgroundColor:'#FFFFFF' },
  chartTitle:{ fontSize:13, fontWeight:'700', color:'#111827' },
  chartSub:{ fontSize:11, color:'#9CA3AF', marginTop:2 },
  recCard:{ borderWidth:1, borderColor:'#E5E7EB', borderRadius:12, padding:12, backgroundColor:'#FFFFFF' },
  recTitle:{ fontSize:13, fontWeight:'700', color:'#111827' },
  recNum:{ width:20, height:20, borderRadius:6, backgroundColor:'#0A0A0A', alignItems:'center', justifyContent:'center' },
  recNumText:{ fontSize:11, fontWeight:'700', color:'#FFFFFF' },
  recText:{ flex:1, fontSize:12, color:'#111827', lineHeight:16 },
  breakdownTitle:{ fontSize:12, fontWeight:'700', color:'#111827', marginTop:4 },
  card:{ borderWidth:1, borderColor:'#E5E7EB', borderRadius:12, backgroundColor:'#FFFFFF', overflow:'hidden' },
  head:{ flexDirection:'row', gap:10, padding:12, alignItems:'center' },
  pctBox:{ width:44, height:44, borderRadius:10, alignItems:'center', justifyContent:'center', borderWidth:1 },
  pctText:{ fontSize:12, fontWeight:'800' },
  name:{ fontSize:13, fontWeight:'700', color:'#111827' },
  catChip:{ borderWidth:1, borderColor:'#E5E7EB', backgroundColor:'#F3F4F6', paddingHorizontal:6, paddingVertical:2, borderRadius:6 },
  catText:{ fontSize:10, color:'#6B7280', fontWeight:'600', textTransform:'capitalize' },
  hazardChip:{ paddingHorizontal:8, paddingVertical:4, borderRadius:9999, borderWidth:1 },
  hazardChipText:{ fontSize:10, fontWeight:'700', textTransform:'capitalize' },
  conf:{ fontSize:11, color:'#6B7280' },
  body:{ borderTopWidth:1, borderTopColor:'#E5E7EB', padding:12, gap:12 },
  desc:{ fontSize:12, color:'#111827', lineHeight:16 },
  barTrack:{ height:6, borderRadius:9999, backgroundColor:'#E5E7EB', overflow:'hidden' },
  barFill:{ height:'100%', borderRadius:9999 },
  barLabel:{ fontSize:10, color:'#9CA3AF', marginTop:4 },
  subTitle:{ fontSize:11, fontWeight:'700', color:'#6B7280', letterSpacing:0.3 },
  toxinChip:{ backgroundColor:'#FEE2E2', borderColor:'#FECACA', borderWidth:1, paddingHorizontal:8, paddingVertical:3, borderRadius:9999 },
  toxinText:{ fontSize:11, color:'#991B1B', fontWeight:'600' },
  disposalBox:{ borderWidth:1, borderRadius:10, padding:10, gap:4 },
  disposalTitle:{ fontSize:11, fontWeight:'700', letterSpacing:0.3 },
  disposalText:{ fontSize:12, color:'#111827', lineHeight:16 },
  disposalLabel:{ fontWeight:'700', color:'#6B7280' },
  impactCard:{ borderWidth:1, borderColor:'#FDE68A', backgroundColor:'#FFFBEB', borderRadius:12, padding:12 },
  impactTitle:{ fontSize:12, fontWeight:'700', color:'#92400E' },
  impactText:{ fontSize:12, color:'#78350F', lineHeight:16 },
});
