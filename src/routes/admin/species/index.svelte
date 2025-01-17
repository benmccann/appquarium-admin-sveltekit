<script lang="ts">
	import { buttonsAdd, header } from '../../../components/pages/admin/index/Modeles';

	import BaseHeader from '../../../components/atoms/typography/header/BaseHeader.svelte';
	import BaseButton from '../../../components/atoms/button/BaseButton.svelte';
	import type Species from '../../../app/species/global/entities/Species';
	import UserUseCase from '../../../app/user/useCases/UseCase';
	import type Result from '../../../app/utils/useCasesResult/Result';
	import SpeciesUseCase from '../../../app/species/global/useCases/UseCase';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let listOfSpecies: Array<Species> = [];
	const userUseCase: UserUseCase = new UserUseCase();
	const jwt: Result = userUseCase.getToken();

	let totalOfSpecies: number = 0;
	let totalPages: number = 1;
	let itemsPerPage: number = 10;
	let currentPage: number = 1;

	let loadingSpecies: boolean = true;

	onMount(async () => {
		const loadTotalOfSpeciesResult: number | void = await loadTotalOfSpecies();

		if (typeof loadTotalOfSpeciesResult === 'number') {
			totalOfSpecies = loadTotalOfSpeciesResult;
		}

		totalPages = computePagination(totalOfSpecies, itemsPerPage);
		currentPage =
			$page.url.searchParams.get('page') !== null
				? parseInt($page.url.searchParams.get('page'))
				: 1;
		currentPage--;

		const loadSpeciesResult: Array<Species> | void = await loadSpecies(
			[],
			itemsPerPage,
			currentPage
		);

		if (Array.isArray(loadSpeciesResult)) {
			listOfSpecies = loadSpeciesResult;
		}

		loadingSpecies = false;
	});

	async function loadSpecies(
		filters: Array<object> = [],
		limit: number = itemsPerPage,
		currentPageNumber = currentPage
	): Promise<Array<Species> | void> {
		const speciesUseCase: SpeciesUseCase = new SpeciesUseCase();

		const listOfSpeciesFromHasura: Result = await speciesUseCase.getListOfSpecies(
			jwt.content,
			[],
			limit,
			currentPageNumber * limit
		);
		console.log(listOfSpeciesFromHasura);

		if (listOfSpeciesFromHasura.isFailed()) {
			for (const error of listOfSpeciesFromHasura.errors) {
				if (error.code === 401) {
					userUseCase.logout();
					return goto('/');
				}
			}

			return listOfSpeciesFromHasura.content;
		}

		return listOfSpeciesFromHasura.content;
	}

	async function loadTotalOfSpecies(): Promise<number | void> {
		const userUseCase: UserUseCase = new UserUseCase();
		const jwt: Result = userUseCase.getToken();

		const speciesUseCase: SpeciesUseCase = new SpeciesUseCase();
		const totalOfSpeciesFromHasura: Result = await speciesUseCase.getTotalSpecies(jwt.content);

		if (totalOfSpeciesFromHasura.isFailed()) {
			for (const error of totalOfSpeciesFromHasura.errors) {
				if (error.code === 401) {
					userUseCase.logout();
					return goto('/');
				}
			}

			return totalOfSpeciesFromHasura.content;
		}

		return totalOfSpeciesFromHasura.content;
	}

	function computePagination(totalSpecies: number, itemPerPages: number): number {
		return Math.ceil(totalSpecies / itemPerPages);
	}

	async function loadSpeciesWithFilters(
		nbOfItemsPerPage: number = itemsPerPage,
		newPage: number = 1
	) {
		loadingSpecies = true;
		currentPage = newPage - 1;

		const loadSpeciesResult: Array<Species> | void = await loadSpecies(
			[],
			nbOfItemsPerPage,
			currentPage
		);

		if (Array.isArray(loadSpeciesResult)) {
			listOfSpecies = loadSpeciesResult;
		}

		$page.url.searchParams.set('page', currentPage + '');
		window.history.replaceState({}, '', $page.url.pathname + $page.url.search);

		loadingSpecies = false;
	}
</script>

<div class="flex-c" id="content">
	<BaseHeader baseHeaderModel={header} />
	{#if loadingSpecies}
		<p>chargement</p>
	{:else}
		<table class="table-auto">
			<thead>
				<tr>
					<th scope="col">#</th>
					<th scope="col">Nom scientifique</th>
					<th scope="col">Type</th>
					<th scope="col">Etat</th>
					<th scope="col">Créé le</th>
					<th scope="col">Modifié le</th>
				</tr>
			</thead>
			<tbody>
				{#each listOfSpecies as species, i}
					<tr>
						<td>{i + 1}</td>
						<td>
							<a
								class="font-semibold text-blue-500 hover:text-blue-700 transition-colors duration-300"
								href={species.computeLinkToSpecies()}
								sveltekit:prefetch>{species.computeName()}</a
							>
						</td>
						<td>{species.category}</td>
						<td>{species.getPublicationStateContent()}</td>
						<td
							>{species.created_at.getDate() +
								'/' +
								species.created_at.getMonth() +
								'/' +
								species.created_at.getFullYear() +
								' ' +
								species.created_at.getHours() +
								':' +
								species.created_at.getMinutes()}</td
						>
						<td
							>{species.updated_at.getDate() +
								'/' +
								species.updated_at.getMonth() +
								'/' +
								species.updated_at.getFullYear() +
								' ' +
								species.updated_at.getHours() +
								':' +
								species.updated_at.getMinutes()}</td
						>
					</tr>
				{/each}
			</tbody>
		</table>

		<div class="flex-r space-x-3 my-6">
			{#each Array(totalPages) as _, i}
				{#if i === currentPage}
					<button disabled class="font-bold text-blue-500">{i + 1}</button>
				{:else}
					<button on:click={() => loadSpeciesWithFilters(itemsPerPage, i + 1)} class="text-blue-500"
						>{i + 1}</button
					>
				{/if}
			{/each}
		</div>
	{/if}

	<div class="flex-r">
		{#each buttonsAdd as button}
			<a href={button['link']}>
				<BaseButton baseButtonModel={button['modele']} />
			</a>
		{/each}
	</div>
</div>

<style>
</style>
