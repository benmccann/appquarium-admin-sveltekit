import UseCaseError from "../../../utils/useCasesResult/types/UseCaseError";
import Species from "../../global/entities/Species";
import SpeciesFamily from "../../global/entities/SpeciesFamily";
import SpeciesGenre from "../../species/global/entities/SpeciesGenre";

export default interface ServicesInterface {
  queryGetListOfPlants(jwt: string): Promise<Array<Species> | UseCaseError>

  queryPlantFamilies(jwt: string): Promise<Array<SpeciesFamily> | UseCaseError>

  queryPlantGenres(jwt: string): Promise<Array<SpeciesGenre> | UseCaseError>
}