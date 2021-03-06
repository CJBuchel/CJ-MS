import React, { useState } from "react";
import { onClockEndEvent, onClockEndGameEvent, onClockPrestartEvent, onClockReloadEvent, onClockStartEvent, onClockStopEvent, onClockTimeEvent, onScoreUpdateEvent, onSystemRefreshEvent, sendClockPrestartEvent } from '../comm_service';
import { ExportToCsv } from 'export-to-csv';

// import './Display.css'
import './Table.css'


const request = "http://" + window.location.hostname + ":3001/api";
const get_teams_request = request+"/teams/get";
const get_schedule_request = request+"/scheduleSet/get";
const get_matches_request = request+"/matches/get";

// 
// Team stuff
// 

function getTeams() {
	return fetch(get_teams_request)
	.then((response) => {
		return response.json();
	}).then(data => {
		if (data.message) {
			alert(data.message);
		} else {
			return data;
		}
	}).catch((error) => {
		console.log("Error: " + error);
	});
}

function getSchedule() {
	return fetch(get_schedule_request)
	.then((response) => {
		return response.json();
	}).then(data => {
		if (data.message) {
			alert(data.message);
		} else {
			return data;
		}
	}).catch((error) => {
		console.log("Error: " + error);
	});
}

function getMatches() {
	return fetch(get_matches_request)
	.then((response) => {
		return response.json();
	}).then(data => {
		if (data.message) {
			alert(data.message);
		} else {
			return data;
		}
	}).catch((error) => {
		console.log("Error: " + error);
	});
}

const getNonNullData = (data:any) => {
	return ( data === 'undefined' ? 'null' : data === 'null' ? 'null' : data === null ? 'null' : data );
}

const getBlankIfNull = (data:any) => {
	return (getNonNullData(data) === 'null' ? '' : data);
}

const getNumberGP = (data:any) => {
	switch (data) {
		case "Developing [2]":
			return getNonNullData("2");
			break;

		case "Accomplished [3]":
			return getNonNullData("3");
			break;
		
		case "Exceeds [4]":
			return getNonNullData("4");
			break;

		default:
			return "";
			break;
	}
}

function appendTeamTable(matches:any, team:any) {
	let fll_display:any = document.getElementById("fll_teams_table");

	var bad_matches = [false, false, false];
	var rescheduled_matches = [false, false, false];

	// const matches = await getMatches();
	var match_index = 0;
	for (const match of matches) {
		if (team.team_number === match.next_team1_number || team.team_number === match.next_team2_number) {
			if (match.rescheduled) {
				rescheduled_matches[match_index] = true;
			} else if (match.complete) {
				switch(match_index) {
					case 0:
						if (getBlankIfNull(team.match_score_1) === '') { bad_matches[match_index] = true; }
						break;
					case 1:
						if (getBlankIfNull(team.match_score_2) === '') { bad_matches[match_index] = true; }
						break;
					case 2:
						if (getBlankIfNull(team.match_score_3) === '') { bad_matches[match_index] = true; }
						break;
				}
			}
			match_index = match_index + 1;
		}
	}

	let tr = document.createElement("tr");

		
	let td_rank = document.createElement("td");
	td_rank.appendChild(document.createTextNode(getBlankIfNull(team.ranking)));

	let td_teamNumber = document.createElement("td");
	td_teamNumber.appendChild(document.createTextNode(getBlankIfNull(team.team_number)));
	
	let td_teamName = document.createElement("td");
	td_teamName.appendChild(document.createTextNode(getBlankIfNull(team.team_name)));

	let td_r1 = document.createElement("td");
	td_r1.appendChild(document.createTextNode(getBlankIfNull(team.affiliation)));

	// Score
	let td_r2 = document.createElement("td");
	td_r2.appendChild(document.createTextNode(getBlankIfNull(team.match_score_1)));
	if (rescheduled_matches[0]) {
		td_r2.style.backgroundColor = "orange";
	} else if (bad_matches[0]) {
		td_r2.style.backgroundColor = "red";
	}

	let td_r3 = document.createElement("td");
	td_r3.appendChild(document.createTextNode(getBlankIfNull(team.match_gp_1)));

	let td_r4 = document.createElement("td");
	td_r4.appendChild(document.createTextNode(getBlankIfNull(team.team_notes_1)));



	let td_r5 = document.createElement("td");
	td_r5.appendChild(document.createTextNode(getBlankIfNull(team.match_score_2)));
	if (rescheduled_matches[1]) {
		td_r5.style.backgroundColor = "orange";
	} else if (bad_matches[1]) {
		td_r5.style.backgroundColor = "red";
	}

	let td_r6 = document.createElement("td");
	td_r6.appendChild(document.createTextNode(getBlankIfNull(team.match_gp_2)));

	let td_r7 = document.createElement("td");
	td_r7.appendChild(document.createTextNode(getBlankIfNull(team.team_notes_2)));



	let td_r8 = document.createElement("td");
	td_r8.appendChild(document.createTextNode(getBlankIfNull(team.match_score_3)));
	if (rescheduled_matches[2]) {
		td_r8.style.backgroundColor = "orange";
	} else if (bad_matches[2]) {
		td_r8.style.backgroundColor = "red";
	}

	// GP
	let td_r9 = document.createElement("td");
	td_r9.appendChild(document.createTextNode(getBlankIfNull(team.match_gp_3)));

	let td_r10 = document.createElement("td");
	td_r10.appendChild(document.createTextNode(getBlankIfNull(team.team_notes_3)));





	tr.appendChild(td_rank);
	tr.appendChild(td_teamNumber);
	tr.appendChild(td_teamName);
	tr.appendChild(td_r1);
	tr.appendChild(td_r2);
	tr.appendChild(td_r3);
	tr.appendChild(td_r4);
	tr.appendChild(td_r5);
	tr.appendChild(td_r6);
	tr.appendChild(td_r7);
	tr.appendChild(td_r8);
	tr.appendChild(td_r9);
	tr.appendChild(td_r10);

	
	fll_display.appendChild(tr);
}

function appendTeamSchedule(matches:any, team:any) {

	for (const match of matches) {

		if (match.team_number == team.team_number) {
			console.log("Match team number: " + match.team_number + ", Team: " + team.team_number);
			console.log("Team Found");
	
			let fll_display:any = document.getElementById("fll_teams_schedule");
		
			let tr = document.createElement("tr");
			
			let td_name = document.createElement("td");
			td_name.appendChild(document.createTextNode("Name: " + team.team_name));

			let td_match = document.createElement("td");
			td_match.appendChild(document.createTextNode("Match: " + match.match_number));
		
			let td_start = document.createElement("td");
			td_start.appendChild(document.createTextNode("Start Time: " + match.start_time));
		
			let td_end = document.createElement("td");
			td_end.appendChild(document.createTextNode("End Time: " + match.end_time));
		
			let td_number = document.createElement("td");
			td_number.appendChild(document.createTextNode("Team Number: " + match.team_number));
			
			tr.appendChild(td_name);
			tr.appendChild(td_match);
			tr.appendChild(td_start);
			tr.appendChild(td_end);
			tr.appendChild(td_number);
	
			fll_display.appendChild(tr);
		}
	}
}

function clearTeamsTable() {
	let fll_display:any = document.getElementById("fll_teams_table");

	while (fll_display.firstChild) {
		fll_display.removeChild(fll_display.lastChild);
	}
}

function clearTeamsScheduleTable() {
	let fll_display:any = document.getElementById("fll_teams_schedule");

	while (fll_display.firstChild) {
		fll_display.removeChild(fll_display.lastChild);
	}
}

async function appendTeamsTable(data:any) {

	clearTeamsTable();
	clearTeamsScheduleTable();
	
	const matches = await getMatches();
	for (const team of data) {
		appendTeamTable(matches, team);
	}
}

async function handleDownloadCSV() {
	const data = await getTeams();
	const teams = [];
	
	const options = {
		fieldSeparator: ',',
		quoteStrings: '"',
		decimalSeparator: '.',
		showLabels: true, 
		showTitle: true,
		filename: 'cj_tms_teams_export',
		title: 'cj_tms_teams_export',
		useTextFile: false,
		useBom: true,
		useKeysAsHeaders: true,
	};

	for (const team of data) {
		teams.push({
			ranking: getBlankIfNull(team.ranking),
			team_number :getBlankIfNull(team.team_number),
			team: getBlankIfNull(team.team_name),
			affiliation: getBlankIfNull(team.affiliation),

			match_1_score: getBlankIfNull(team.match_score_1),
			match_1_gp: getNumberGP(team.match_gp_1),
			match_1_notes: getBlankIfNull(team.team_notes_1),

			match_2_score: getBlankIfNull(team.match_score_2),
			match_2_gp: getNumberGP(team.match_gp_2),
			match_2_notes: getBlankIfNull(team.team_notes_2),

			match_3_score: getBlankIfNull(team.match_score_3),
			match_3_gp: getNumberGP(team.match_gp_3),
			match_3_notes: getBlankIfNull(team.team_notes_3)
		});
	}

	const csvExporter = new ExportToCsv(options);
	csvExporter.generateCsv(teams);
}

async function displayTeams(showTeams:boolean) {
	if (showTeams) {
		const teams = await getTeams();
		console.log(teams);
		appendTeamsTable(teams);
	}
}

async function filterTeams(query:any) {
	clearTeamsTable();
	clearTeamsScheduleTable();
	const teams = await getTeams();
	const matches = await getSchedule();
	const scheduled_matches = await getMatches();

	if (!query) {
		return displayTeams(true);
	} else {
		for (const team of teams) {
			const teamNumber = team.team_number.toLowerCase();
			const teamName = team.team_name.toLowerCase();
			const teamAffilation = team.affiliation.toLowerCase();

			if (teamName.includes(query.toLowerCase()) || teamNumber.includes(query.toLowerCase()) || teamAffilation.includes(query.toLowerCase())) {
				appendTeamTable(scheduled_matches, team);
				appendTeamSchedule(matches, team);
			}
		}
	}
}

const TeamTable = () => {
	return (
		<div id="fll_table_header_wrapper" className="table-wrapper">
			<table className="fll-table">
				<thead>
					<tr>
						<th>Rank</th>
						<th>Team Number</th>
						<th>TeamName</th>
						<th>Affiliation</th>

						<th>R1 Score</th>
						<th>R1 GP</th>
						<th>R1 Notes</th>

						<th>R2 Score</th>
						<th>R2 GP</th>
						<th>R2 Notes</th>

						<th>R3 Score</th>
						<th>R3 GP</th>
						<th>R3 Notes</th>
					</tr>
				</thead>

				<tbody id="fll_teams_table">
					{/* React controller above */}
				</tbody>

			</table>

			<table className="fll-table-schedule">
				<thead>
					<tr>
						<th>Team Name</th>
						<th>Match</th>
						<th>Start Time</th>
						<th>End Time</th>
						<th>Team Number</th>
					</tr>
				</thead>

				<tbody id="fll_teams_schedule">
					{/* React controller above */}
				</tbody>

			</table>
		</div>
	);
}

const TeamSearch = () => {
	// const teams = getTeams();
	return (
		<div>
			<form action="/" method="get">
				<label htmlFor="header-search">
				</label>
				<input 
					type="text"
					id="team-search"
					placeholder="Search Team..."
					name="search"
					onInput={(e:any) => filterTeams(e.target.value)}
				/>
			</form>
			<TeamTable/>
		</div>
	);
}


function Display() {
	const [showTable, setShowTable] = useState(true);
	const [showSearch, setShowSearch] = useState(false);

	const _removeSubscriptions = [];

	setTimeout(function() {displayTeams(showTable)}, 100);

	onScoreUpdateEvent(() => {
		displayTeams(showTable);
	}).then((removeSubscription:any) => { _removeSubscriptions.push(removeSubscription) })
	.catch((err:any) => {
		console.error(err)
	});

	onSystemRefreshEvent(() => {
		window.location.reload();
	}).then((removeSubscription:any) => { _removeSubscriptions.push(removeSubscription) })
	.catch((err:any) => {
		console.error(err)
	});



	return(
		<div>
			<button onClick={() => handleDownloadCSV()} className="hoverButton red">Export CSV</button>
			<div className="display" id="fll_display">
				<h2>Judge Display (give 5 seconds to load)</h2>

				<button onClick={() => {setShowSearch(true); setShowTable(false)}} className="hoverButton orange">Search For Team</button>
				<button onClick={() => {setShowSearch(false); setShowTable(true)}} className="hoverButton green">Display All Teams</button>
				{showTable && <TeamTable/>}
				{showSearch && <TeamSearch/>}
			</div>
		</div>

	);
}

export default Display;